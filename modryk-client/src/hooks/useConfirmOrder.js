import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  getCurrentSubMethod,
  recalculateCart,
  selectCart,
  selectCartError,
  selectCartLoading,
  selectSubmitCartDataWrapper,
  updateSubmitCartData,
} from "../data/cart/cartSlice";
import { selectDeliveryMethods } from "../data/general/generalSlice";
import {
  fetchAddresses,
  fetchDefaultAddress,
  selectSelectedAddressId,
} from "../data/addresses/addressesSlice";

/**
 * Custom Hook that encapsulates all business logic, data fetching,
 * and delivery method calculations for the ConfirmOrder screen.
 */
export function useConfirmOrder() {
  const dispatch = useDispatch();

  const cart = useSelector(selectCart);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const deliveryMethods = useSelector(selectDeliveryMethods);
  const selectedAddressId = useSelector(selectSelectedAddressId);
  const submitCartDataWrapper = useSelector(selectSubmitCartDataWrapper);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedSubMethod, setSelectedSubMethod] = useState(null);

  const currentType = selectedType ?? deliveryMethods?.[0]?.id ?? null;
  const currentSubMethods = useSelector((state) =>
    getCurrentSubMethod(state, currentType),
  );

  const currentSubMethod = currentSubMethods?.some(
    (sub) => sub.id === selectedSubMethod,
  )
    ? selectedSubMethod
    : null;

  // Initial data loading on mount
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
    dispatch(fetchDefaultAddress());
  }, [dispatch]);

  // Synchronize top-level wrapper data (address, method, sub-method)
  useEffect(() => {
    const updates = {};

    if (
      currentType !== null &&
      submitCartDataWrapper.delivery_method_id !== currentType
    ) {
      updates.delivery_method_id = currentType;
    }
    if (
      selectedSubMethod !== null &&
      submitCartDataWrapper.delivery_sub_method_id !== selectedSubMethod
    ) {
      updates.delivery_sub_method_id = selectedSubMethod;
    }
    if (
      selectedAddressId !== null &&
      submitCartDataWrapper.address_id !== selectedAddressId
    ) {
      updates.address_id = selectedAddressId;
    }

    if (Object.keys(updates).length > 0) {
      dispatch(updateSubmitCartData(updates));
    }
  }, [
    dispatch,
    currentType,
    selectedSubMethod,
    selectedAddressId,
    submitCartDataWrapper.delivery_method_id,
    submitCartDataWrapper.delivery_sub_method_id,
    submitCartDataWrapper.address_id,
  ]);

  // Handler for changing main delivery method (recalculates ONLY upon sub-method selection)
  const handleMethodChange = (methodId) => {
    setSelectedType(methodId);
    setSelectedSubMethod(null);

    dispatch(
      updateSubmitCartData({
        delivery_method_id: methodId,
        delivery_sub_method_id: null,
      }),
    );
  };

  // Handler for changing delivery sub-method (strictly awaits recalculateCart)
  const handleSubMethodChange = async (subMethodId) => {
    try {
      await dispatch(
        recalculateCart({ delivery_sub_method_id: subMethodId }),
      ).unwrap();
      setSelectedSubMethod(subMethodId);
      dispatch(updateSubmitCartData({ delivery_sub_method_id: subMethodId }));
    } catch {
      // If recalculate fails, do NOT change state
    }
  };

  const retryFetchCart = () => {
    dispatch(fetchCart());
  };

  const isCartEmpty = useMemo(() => {
    return (
      !cart ||
      (Array.isArray(cart) && cart.length === 0) ||
      (typeof cart === "object" && Object.keys(cart).length === 0) ||
      (Array.isArray(cart.cart_items) &&
        cart.cart_items.length === 0 &&
        !cart.num_of_sheep &&
        !cart.num_of_sheeps)
    );
  }, [cart]);

  return {
    cart,
    loading,
    error,
    isCartEmpty,
    deliveryMethods,
    currentType,
    currentSubMethods,
    currentSubMethod,
    selectedAddressId,
    submitCartDataWrapper,
    handleMethodChange,
    handleSubMethodChange,
    retryFetchCart,
  };
}

export default useConfirmOrder;

