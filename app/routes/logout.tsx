import { redirect } from "react-router";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  return redirect("/login", {
    headers: {
      "Set-Cookie": "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure",
    },
  });
}

export async function loader() {
  return redirect("/login");
}
