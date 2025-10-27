
import { ShoppingView } from "../../components/shopping/shopping-view";

// This is a Server Component by default in App Router
export default function ShoppingPage() {
  return (
    <main>
      {/* 
        ShoppingView is a Client Component that handles all interactivity.
        By rendering it from a Server Component, we ensure that any code 
        accessing localStorage or relying on browser APIs (like in the store) 
        only runs on the client, preventing hydration errors.
      */}
      <ShoppingView />
    </main>
  );
}
