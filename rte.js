class Rte {
  constructor(root, width, height) {
    this.state = {
      root: root,
      width: width,
      height: height,
      editor: null,
      contentDocument: null,
      commandArea: null
    };
  }
  getRoot() {
    return this.state.root;
  }
  getWidth() {
    return this.state.width;
  }
  getHeight() {
    return this.state.height;
  }
  setEditor(editor) {
    this.state.editor = editor;
  }
  getEditor() {
    return this.state.editor;
  }
  /**
   * contentDocumentをセットする。
   * @param {*} contentDocument
   */
  setContentDocument(contentDocument) {
    this.state.contentDocument = contentDocument;
  }
  /**
   * contentDocumentを返す。
   */
  getContentDocument() {
    return this.state.contentDocument;
  }
  /**
   * コマンド欄をセットする。
   * @param {*} commandArea
   */
  setCommandArea(commandArea) {
    this.state.commandArea = commandArea;
  }
  /**
   * コマンド欄を返す。
   */
  getCommandArea() {
    return this.state.commandArea;
  }
}

/**
 * リッチテキストエディタを使用可能にする。
 * @param {*} root
 * @param {*} width
 * @param {*} height
 */
function initRte(root, width, height) {
  let rte = new Rte(root, width, height);
  initEditor(rte);
  initCommands(rte);
  addEventListeners(rte);
}

/**
 * 入力部分を描画し、rteインスタンスにeditorをセットする。
 * @param {Rteオブジェクト} rte
 */
function initEditor(rte) {
  const root = rte.getRoot();
  const width = rte.getWidth();
  const height = rte.getHeight();

  const iframe = document.createElement("iframe");
  iframe.setAttribute("id", "rte_iframe");
  root.appendChild(iframe);
  let doc;
  if (document.all) {
    doc = frames["rte_iframe"].document;
  } else {
    doc = iframe.contentDocument;
  }
  rte.setContentDocument(doc);
  const editor = doc.createElement("div");
  editor.setAttribute("id", "rte_editor");
  editor.setAttribute("contenteditable", true);
  doc.body.appendChild(editor);
  iframe.style.cssText =
    "border: 1px solid black; width: " +
    width +
    "px; height: " +
    height +
    "px;";
  editor.style.cssText = "width: 100%; height: 100%";
  rte.setEditor(editor);
}

/**
 * コマンドエリアを描画する。
 * @param {Rte}} rte
 */
function initCommands(rte) {
  const editor = rte.getEditor();
  const doc = rte.getContentDocument();

  const commandArea = doc.createElement("div");
  commandArea.setAttribute("class", "rte_commandArea");
  commandArea.setAttribute("id", "rte_commandArea");
  commandArea.style.cssText =
    "width: 100%; height: 2em; border-bottom: 1px solid black;";
  editor.parentNode.insertBefore(commandArea, editor);

  rte.setCommandArea(commandArea);

  // サイズ変更ボタンを配置
  initSizeButton(rte);
  // Boldボタンを配置
  initBoldButton(rte);
  // 斜体（イタリック）ボタンを配置
  initItalicButton(rte);
  // アンダーラインボタンを配置
  initUnderlineButton(rte);
  // 左寄せボタンを配置
  initLeftAlignmentButton(rte);
  // 中央寄せボタンを配置
  initCenterAlignmentButton(rte);
  // 右寄せボタンを配置
  initRightAlignmentButton(rte);
  // 水平線挿入ボタンを配置
  initHorizontalRuleButton(rte);
}

/**
 * 指定された名前のbuttonエレメントを作成して返す。
 * @param {contentDocument} doc
 * @param {*} name 表示名
 */
function createButton(doc, name) {
  const btn = doc.createElement("button");
  btn.textContent = name;
  return btn;
}

/**
 * サイズ指定ボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initSizeButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const size = createButton(doc, "サイズ");
  size.onclick = () => {
    alert("size");
  };
  commandArea.appendChild(size);
}

/**
 * Boldボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initBoldButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const bold = createButton(doc, "bold");
  const editor = rte.getEditor();
  bold.onclick = () => toggleBoldLogic(doc, editor);
  commandArea.appendChild(bold);
}

/**
 * 太字切り替えロジック
 * @param {*} doc
 * @param {*} editor
 */
function toggleBoldLogic(doc, editor) {
  const sel = doc.getSelection();
  let range = sanitize(sel.getRangeAt(0));
  const ancestor = range.commonAncestorContainer;
  for (let i = 0; i < ancestor.childNodes.length; i++) {
    checkNode(doc, ancestor.childNodes[i], range, "bold");
  }
}

function checkNode(doc, node, range, style) {
  let nodeRange = new Range();
  nodeRange.selectNode(node);
  if (
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0 &&
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0
  ) {
    if (containsRteSpanClass(node)) {
      node.style.fontWeight =
        node.style.fontWeight == "bold" ? "normal" : "bold";
    } else if (isBoldDecorativeTag(node)) {
      const newSpan = doc.createElement("span");
      const inner = node.innerHTML;
      newSpan.innerHTML = inner;
      newSpan.style.fontWeight = "normal";
      node.parentNode.replaceChild(newSpan, node);
    } else if (isBold(node)) {
      if (node.nodeType == Node.TEXT_NODE) {
        const span = doc.createElement("span");
        span.style.fontWeight = "normal";
        node.parentNode.appendChild(span);
        span.appendChild(node);
      } else {
        node.style.fontWeight = "normal";
      }
    } else {
      if (node.nodeType == Node.TEXT_NODE) {
        console.log(node.parentNode.nodeName);
        const span = doc.createElement("span");
        const styleClass = "rte_span";
        span.classList.add(styleClass);
        span.style.fontWeight = "bold";
        node.parentNode.appendChild(span);
        node.parentNode.insertBefore(span, node);
        span.appendChild(node);
      } else {
        node.style.fontWeight = "bold";
      }
    }
  } else if (
    range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0 ||
    range.compareBoundaryPoints(Range.ENDT_TO_START, nodeRange) >= 0
  ) {
    return;
  } else {
    for (let i = 0; i < node.childNodes.length; i++) {
      checkNode(doc, node.childNodes[i], range, style);
    }
  }
}

/**
 * 選択範囲にテキストノードが含まれる場合、分割する
 * @param {*} range
 */
function sanitize(range) {
  if (range.startContainer.nodeType == Node.TEXT_NODE) {
    const start = range.startContainer.splitText(range.startOffset);
    range.setStartBefore(start);
  }
  if (range.endContainer.nodeType == Node.TEXT_NODE) {
    const end = range.endContainer.splitText(range.endOffset);
    range.setEndBefore(end);
  }
  return range;
}

function containsRteSpanClass(node) {
  return node.classList && node.classList.contains("rte_span");
}
/**
 * 太字かどうか判定する
 * @param {*} node
 */
function isBold(node) {
  return node.style && node.style.fontWeight == "bold";
}

function isBoldDecorativeTag(node) {
  return node.nodeName == "STRONG" || node.nodeName == "B";
}

/**
 * Italic（斜体）ボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initItalicButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const italic = createButton(doc, "italic");
  const editor = rte.getEditor();
  italic.onclick = () => toggleItalicLogic(doc, editor);
  commandArea.appendChild(italic);
}

/**
 * 斜体切り替えロジック
 * @param {*} doc
 * @param {*} editor
 */
function toggleItalicLogic(doc, editor) {
  alert("toggleItalic");
}

/**
 * 下線ボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initUnderlineButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const underline = createButton(doc, "underline");
  const editor = rte.getEditor();
  underline.onclick = () => toggleUnderlineLogic(doc, editor);
  commandArea.appendChild(underline);
}

function toggleUnderlineLogic(doc, editor) {
  alert("toggleUnderline");
}

/**
 * 左寄せボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initLeftAlignmentButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const leftAlignment = createButton(doc, "left");
  leftAlignment.onclick = () => {};
  commandArea.appendChild(leftAlignment);
}

/**
 * 中央寄せボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initCenterAlignmentButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const centerAlignment = createButton(doc, "center");
  centerAlignment.onclick = () => {};
  commandArea.appendChild(centerAlignment);
}

/**
 * 右寄せボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initRightAlignmentButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const rightAlignent = createButton(doc, "right");
  rightAlignent.onclick = () => {};
  commandArea.appendChild(rightAlignent);
}

/**
 * 水平線挿入ボタンをコマンドエリアに描画する。
 * @param {Rte} rte
 */
function initHorizontalRuleButton(rte) {
  const doc = rte.getContentDocument();
  const commandArea = rte.getCommandArea();
  const insertHR = createButton(doc, "hr");
  const editor = rte.getEditor();
  insertHR.onclick = () => insertHRLogic(doc, editor);
  commandArea.appendChild(insertHR);
}

/**
 * 水平線挿入ロジック
 * @param {*} doc
 * @param {*} editor
 */
function insertHRLogic(doc, editor) {
  const hr = doc.createElement("hr");
  hr.setAttribute("contenteditable", false);
  hr.setAttribute("style", "pointer-events: none;");
  editor.appendChild(hr);
}

/**
 * WebAPIのgetSelection()のラッパーメソッド。
 * ネイティブでは、同一階層に複数要素があり、かつその中にテキストが存在する場合、キャレットのオフセットを取得することができない。
 * ex. :
 *  <div>
 *    <p>foo</p><p>bar</p>
 *  </div>
 * ネイティブの場合、このようなDOMで、かつ"bar"の"r"にキャレットが置かれている場合、オフセットは3ではなく「要素のインデックス」である1が返る.
 * これに対応するために本メソッドを使用する。
 * @param {Rte} rte
 */
function getSelection(rte) {
  const doc = rte.getContentDocument();
  const sel = doc.getSelection();
}

/**
 * WebAPIのSelectionオブジェクトのラッパークラス。
 * ネイティブでは、同一階層に複数要素があり、かつその中にテキストが存在する場合、キャレットのオフセットを取得することができない。
 * ex. :
 * <div>
 *    <p>foo</p><p>bar</p>
 *  </div>
 * ネイティブの場合、このようなDOMで、かつ"bar"の"r"にキャレットが置かれている場合、オフセットは3ではなく「要素のインデックス」である1が返る.
 * これに対応するために本クラスを定義した。
 */
class Selection {
  constructor(nativeSelection) {
    this.state = {
      selection: nativeSelection,
      stringOffset: 0
    };
  }
}

/**
 * EventListenerを登録する
 * @param {*} rte
 */
function addEventListeners(rte) {
  const editor = rte.getEditor();

  // BSキー
  editor.addEventListener("keydown", event => {
    if (event.keyCode == 8) {
      if (!deletePreviousNode(rte)) {
        event.stopPropagation();
        event.preventDefault();
      }
    }
  });
}

/**
 * Backspace押下時の処理
 * @param {*} rte
 */
function deletePreviousNode(rte) {
  const doc = rte.getContentDocument();
  const sel = doc.getSelection();

  // 複数Nodeが選択されている場合はブラウザネイティブで削除
  if (!sel.isCollapsed) return true;

  let node = sel.focusNode;
  // 何らかの理由でフォーカスされているノードが存在しない場合は何もせずブラウザバックを抑制
  if (!node) return false;

  let offset = sel.focusOffset;

  // テキストノードかつキャレットが置かれているのが先頭でなければブラウザネイティブで1文字削除
  if (node.nodeType == Node.TEXT_NODE && offset > 0) return true;

  const editor = rte.getEditor();
  cleanEditor(editor);
  if (offset > 0) {
    offset--;
  } else {
    let prev = node.previousSibling;
    if (!prev) {
      node = getPreviousNode(node, editor);
      if (!node || node == editor) {
        return false;
      }
      if (node.childNodes.length > 0) {
        offset = node.childNodes.length - 1;
      }
    } else {
      node = prev;
      offset = nodeLen(node);
    }
  }

  let target = node.childNodes[offset];
  if (!target) {
    target = node;
  }

  // 適切な対象を選択出来なかったかeditorを指定した場合は何もせずブラウザバックを抑制
  if (!target || target == editor) return false;

  // 対象を現在選択している要素の末裔要素に設定
  const walker = doc.createTreeWalker(
    target,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    node => {
      if (node.nodeName == "DIV" && node.childNodes.length == 0) {
        node.parentNode.removeChild(node);
        return NodeFilter.FILTER_REJECT;
      }
      if (node.nodeType == Node.TEXT_NODE && node.data.length == 0) {
        node.parentNode.removeChild(node);
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  );
  let current;
  while ((current = walker.lastChild())) {
    target = current;
  }
  if (
    target.nodeType == Node.TEXT_NODE &&
    target.data &&
    target.data.length > 0
  ) {
    return true;
  }
  if (target.textContent && target.textContent.length > 0) {
    return true;
  }
  target.parentNode.removeChild(target);
  return false;
}

/**
 * 前の要素を返す。
 * 兄弟要素が無い場合は親要素の前の要素（それも無いならその親の要素）。
 *
 * @param {*} node
 * @param {*} offset
 * @param {*} editor
 */
function getPreviousNode(node, editor) {
  let prev = node.previousSibling;
  let parent = node.parentNode;
  while (!prev) {
    if (!parent) {
      return null;
    }
    if (parent == editor) {
      return parent;
    }
    prev = parent.previousSibling;
    parent = parent.parentNode;
  }
  return prev;
}

/**
 * 空のDivを削除する。
 *
 *  @param {*} editor
 */
function cleanEditor(editor) {
  for (let i = 0; i < editor.childNodes.length; i++) {
    const node = editor.childNodes[i];
    if (node.nodeName == "DIV" && node.childNodes.length == 0) {
      node.parentNode.removeChild(node);
    }
  }
}

/**
 * 指定位置にキャレットを移動する。
 * @param {*} doc
 * @param {*} node
 * @param {*} startPos
 * @param {*} endPos
 */
function moveCaret(doc, node, startPos, endPos) {
  const sel = doc.getSelection();
  sel.removeAllRanges();
  let rng = doc.createRange();
  rng.setStart(node, startPos);
  rng.setEnd(node, endPos);
  sel.addRange(rng);
}

/**
 * textのどこにキャレットが置かれているかを取得する
 * @param {*} doc
 * @param {*} range
 * @param {*} node
 */
function getCharacterCaretPosition(doc, range, node) {
  const treeWalker = doc.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    node => {
      let nodeRange = doc.createRange();
      nodeRange.selectNode(node);
      return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
    false
  );

  let cnt = 0;
  while (treeWalker.nextNode()) {
    cnt += treeWalker.currentNode.length;
  }
  if (range.startContainer.nodeType == 3) {
    cnt += range.startOffset;
  }
  return cnt;
}

/**
 * テキストノードなら本文のlength、そうでなければnodeの子要素のlengthを返す。
 * @param node
 * @returns
 */
function nodeLen(node) {
  return node.nodeType == Node.TEXT_NODE
    ? node.data.length
    : node.childNodes.length;
}
