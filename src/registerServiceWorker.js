import { Workbox } from "workbox-window";

let wb;

if ("serviceWorker" in navigator) {

  wb = new Workbox(`${import.meta.env.BASE_URL}service-worker.js`)
  wb.addEventListener("controlling", () => {
    window.location.reload();
  });  
	wb.register();

} else {
  wb = null;
}

export default wb;
