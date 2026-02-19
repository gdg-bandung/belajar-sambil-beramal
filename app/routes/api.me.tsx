import { authService } from "@/server/auth-service.server";

export async function loader({ request }: { request: Request }) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader?.split(";").find((c) => c.trim().startsWith("token="))?.split("=")[1];

  if (!token) {
    return Response.json({ user: null });
  }

  const user = await authService.verifyToken(token);
  return Response.json({ user });
}
