import type { Metadata } from "next";

import { ChatPage } from "./ChatPage";

export const metadata: Metadata = {
  title: "Chat",
};

const Chat = () => {
  return <ChatPage />;
};

export default Chat;
