/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { UiwLoading } from "~/components/icons/UiwLoading";
import { getIsHotdog } from "./_ai/actions";
import { Screens, ScreensContent } from "./_components/screens";
import backgroundImg from "./background.webp";

export const maxDuration = 60;

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<string>("start");
  const [imageDataURL, setImageDataURL] = useState<string>("");
  const [isHotdog, setIsHotdog] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <Screens
        defaultValue="start"
        currentScreen={currentScreen}
        onValueChange={setCurrentScreen}
      >
        <ScreensContent value="start">
          <header>
            <div className="bg-red-600 py-4 text-center">
              <h1
                className="text-5xl font-extrabold uppercase tracking-wide text-white"
                style={{
                  textShadow: `-1px 1px 0 #000,
            1px 1px 0 #000,
            1px -1px 0 #000,
            -1px -1px 0 #000`,
                }}
              >
                SeeFood
              </h1>
            </div>
            <div className="border border-black bg-white py-2 text-center">
              <p className="text-lg font-bold tracking-widest text-red-600">
                &quot;The Shazam for Food&quot;
              </p>
            </div>
          </header>
          <main className="relative grow bg-black">
            <Image
              className="pointer-events-none absolute inset-0 touch-none object-cover opacity-25"
              src={backgroundImg}
              alt="background"
              placeholder="blur"
              fill
              priority
            />
            <div className="absolute bottom-0 flex w-full justify-center pb-4">
              <ShutterButton
                handleImageChange={async (dataURL) => {
                  setImageDataURL(dataURL);
                  setCurrentScreen("analysis");
                  const { isHotdog } = await getIsHotdog(dataURL);
                  setIsHotdog(isHotdog);
                  setCurrentScreen("result");
                }}
              />
            </div>
          </main>
        </ScreensContent>
        <ScreensContent value="analysis">
          <main className="relative grow bg-zinc-700">
            <img
              className="pointer-events-none absolute h-full w-full touch-none object-cover opacity-25"
              src={imageDataURL}
              alt="User uploaded image."
            />
            <div className="absolute grid h-full w-full place-content-center">
              <div className="space-y-4">
                <UiwLoading className="mx-auto h-40 w-40 animate-rotate-steps stroke-black text-red-400" />
                <h5
                  className="text-5xl font-bold text-white"
                  style={{
                    textShadow: `
                    -4px 4px 0 #000,
                    4px 4px 0 #000,
                    4px -4px 0 #000,
                    -4px -4px 0 #000`,
                  }}
                >
                  Evaluating...
                </h5>
              </div>
            </div>
          </main>
        </ScreensContent>
        <ScreensContent value="result">
          <main className="relative grow">
            <img
              className="pointer-events-none absolute -z-10 h-full w-full touch-none object-cover"
              src={imageDataURL}
              alt="User uploaded image."
            />
            <ResultBanner isHotdog={isHotdog} />
          </main>
        </ScreensContent>
      </Screens>
    </div>
  );
}

function ShutterButton({
  handleImageChange,
}: {
  handleImageChange: (dataURL: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/jpeg")) {
      alert("The file is not a valid JPEG image, please try again.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        const dataURL = reader.result;
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        await handleImageChange(dataURL);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/jpeg"
        ref={inputRef}
        onChange={handleInputChange}
        hidden
      ></input>
      <button
        className="mx-auto block h-20 w-20 rounded-full border-4 border-black bg-red-600 transition-colors hover:bg-red-700"
        onClick={() => {
          inputRef.current?.click();
        }}
      ></button>
      <p className="text-lg font-bold text-white">
        Touch to <span className="uppercase">SeeFood</span>
      </p>
    </div>
  );
}

function ResultBanner({ isHotdog }: { isHotdog: boolean }) {
  if (isHotdog) {
    return (
      <div className="border-b-2 border-white bg-green-500 py-5">
        <h5
          className="text-center text-5xl font-extrabold text-white"
          style={{
            textShadow: `-3px 3px 0 #000,
  3px 3px 0 #000,
  3px -3px 0 #000,
  -3px -3px 0 #000`,
          }}
        >
          Hotdog
        </h5>
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 w-full border-t-2 border-white bg-red-600 py-5">
      <h5
        className="text-center text-5xl font-extrabold text-white"
        style={{
          textShadow: `-3px 3px 0 #000,
3px 3px 0 #000,
3px -3px 0 #000,
-3px -3px 0 #000`,
        }}
      >
        Not hotdog
      </h5>
    </div>
  );
}
