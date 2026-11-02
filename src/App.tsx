import { currentLabel } from "./lib/tauri";
import { MainWindow } from "./windows/MainWindow";
import { WidgetWindow } from "./windows/WidgetWindow";

// Both windows load the same index.html; the window label decides which UI renders.
const label = currentLabel();

export default function App() {
  return label === "widget" ? <WidgetWindow /> : <MainWindow />;
}
