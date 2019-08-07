const chat = {
  async open(self) {
    self.showChat = true;
    window.addEventListener("keydown", self.keyClose);
    chat.setBlur(true, document.getElementById("header"), 10);
    chat.setBlur(
      true,
      document.getElementsByClassName("object-tabset tabset")[0],
      10
    );
    chat.setBlur(true, self.$refs.top, 10);
    chat.setFixedPosition(document.getElementById("site-content"));
    chat.setOverflow(document.getElementsByTagName("body")[0], "hidden");
    self.chatLoading = true;
    await self.getMessages();
    await (self.chatLoading = false);
    if (self.$refs.messages)
      self.$refs.messages.scrollTop = self.$refs.messages.scrollHeight;
    if (self.$refs.messages)
      self.$refs.messages.addEventListener("scroll", function() {
        if (self.$refs.messages.scrollTop === 0) self.getMessages(true);
      });
  },
  close(self) {
    self.msgs = [];
    self.importedMsgs = [];
    self.currentPage = 1;
    chat.setBlur(false, document.getElementById("header"), 10);
    chat.setBlur(
      false,
      document.getElementsByClassName("object-tabset tabset")[0],
      10
      );
      chat.setBlur(false, self.$refs.top, 10);
      chat.unsetFixedPosition(document.getElementById("site-content"));
    chat.setOverflow(document.getElementsByTagName("body")[0], "");
    self.showChat = false;
  },
  setBlur(bool, elem, param) {
    if (elem)
      if (bool) elem.style.filter = `blur(${param}px)`;
      else elem.style.filter = ``;
  },
  setOverflow(elem, param) {
    if (elem) elem.style.overflow = param;
  },
  setFixedPosition(elem) {
    if (!elem) return;
    let html = document.documentElement;
    let pos = html.scrollTop;
    elem.style.position = "fixed";
    elem.style.top = `-${pos}px`;
    elem.style.width = "100vw";
  },
  unsetFixedPosition(elem) {
    if (!elem) return;
    let html = document.documentElement;
    let pos = parseInt(elem.style.top);
    elem.style.position = "";
    elem.style.top = ``;
    html.scrollTop = -pos;
    elem.style.width = "";
  }
};

export default chat;
