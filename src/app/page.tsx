import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col gap-2">
        <h1>Hello, world!</h1>
        <Button className="mx-auto">Noop</Button>
      </div>
    </main>
  );
}
