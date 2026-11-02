import { currentLabel } from "./lib/tauri";
import { MainWindow } from "./windows/MainWindow";
import { ReaderWindow } from "./windows/ReaderWindow";
import { WidgetWindow } from "./windows/WidgetWindow";

// All windows load the same index.html; the window label decides which UI renders.
const label = currentLabel();

export default function App() {
  if (label === "widget") return <WidgetWindow />;
  if (label === "reader") return <ReaderWindow />;
  return <MainWindow />;
}
