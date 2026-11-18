import PageTitle from "../shared components/PageTitle";
import PillHeading from "../shared components/PageHeading";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getCartItems } from "../components/cart/CartMock";
import CartItemsList from "../components/cart/CartItemList";

function CartPage() {
  const { t } = useTranslation();
  const [items] = useState(getCartItems);
  return (
    <main className="app-container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageTitle>{t("cart.title")}</PageTitle>
      <PillHeading>{t("cart.contents")}</PillHeading>
      <CartItemsList items={items} />
    </main>
  );
}

export default CartPage;
