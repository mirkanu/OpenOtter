import { redirect } from "next/navigation";

// Per D-01: / is now the recordings list. This route redirects there.
// The redirect preserves any existing links or bookmarks to /recordings/.
export default function RecordingsRedirect() {
  redirect("/");
}
