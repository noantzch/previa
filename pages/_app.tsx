import "@/styles/globals.css";
import type { AppProps } from "next/app";
import GameFoot from "./Components/GameFoot";

export default function App({ Component, pageProps }: AppProps) {
  return(
    <>
    <Component {...pageProps} />;
    <GameFoot />
    </>
  )
}
