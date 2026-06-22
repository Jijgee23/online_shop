import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/auth_context";
import { CategoryProvider } from "./context/category_context";
import { CartProvider } from "./context/cart_context";
import { OrderProvider } from "./context/order_context";
import { ConfirmProvider } from "./context/confirm_context";
import { AddressProvider } from "./context/address_context";
import { WishlistProvider } from "./context/wishlist_context";
import { SettingsProvider } from "./context/settings_context";
import RouterInitializer from "./components/RouterInitializer";
import ThemedToaster from "./components/ThemedToaster";
import ThemeProvider from "./components/ThemeProvider";
import PhoneSetupModal from "./components/PhoneSetupModal";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import { getStoreName } from "@/lib/storeName";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const storeName = await getStoreName();
  return {
    title: storeName,
    description: `${storeName} — онлайн дэлгүүр`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <SettingsProvider>
            <ConfirmProvider>
              <AuthProvider>
                <AddressProvider>
                  <CategoryProvider>
                    <CartProvider>
                      <OrderProvider>
                        <WishlistProvider>
                          <RouterInitializer />
                          <PhoneSetupModal />
                          <LoginModal />
                          <RegisterModal />
                          {children}
                          <ThemedToaster />
                        </WishlistProvider>
                      </OrderProvider>
                    </CartProvider>
                  </CategoryProvider>
                </AddressProvider>
              </AuthProvider>
            </ConfirmProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
