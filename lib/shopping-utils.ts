
import { type ShoppingList, type ShoppingState } from "../store/useShoppingStore";

// --- CALCULATOR ---
export const calcTotals = (list: ShoppingList | undefined) => {
  if (!list) {
    return { estimated: 0, actual: 0, difference: 0 };
  }

  const estimated = list.items.reduce((sum, item) => sum + item.estPrice * item.qty, 0);
  
  const actual = list.items.reduce((sum, item) => {
    if (item.purchased && item.actualPrice !== null) {
      return sum + item.actualPrice * item.qty;
    }
    return sum;
  }, 0);

  const difference = actual - estimated;

  return { estimated, actual, difference };
};

// --- DATA UTILS ---

export const exportToJson = (data: object, filename: string) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = filename;
  link.click();
};

export const importFromJson = (file: File, onRead: (data: ShoppingState) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result;
      if (typeof text === "string") {
        const data = JSON.parse(text);
        onRead(data);
      }
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      alert("Gagal membaca file. Pastikan file tersebut adalah file JSON yang valid.");
    }
  };
  reader.readAsText(file);
};
