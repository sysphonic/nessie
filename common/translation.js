/**-----------------**-----------------**-----------------**
 Copyright (c) 2007-2016, MORITA Shintaro, Sysphonic. All rights reserved.
   http://sysphonic.com/
 This module is released under New BSD License.
 **-----------------**-----------------**-----------------**/

var t_h = {
  "msg.ix_unavailable":
    {
      en: "Reduced Functionality Mode<br/>Your browser doesn't support <b>HTML5 IndexedDB</b>.",
      ja: "機能制限モード<br/>お使いのブラウザは <b>HTML5 IndexedDB</b> に対応していません。"
    },
  "msg.please_wait":
    {
      en: "Please wait",
      ja: "しばらくお待ちください"
    },
  "msg.no_entries":
    {
      en: "No entries found.",
      ja: "登録されていません"
    },
  "msg.hyphen":
    {
      en: "-",
      ja: "－"
    },
  "cap.suffix":
    {
      en: " : ",
      ja: "："
    },
  "btn.yes":
    {
      en: "Yes",
      ja: "はい"
    },
  "btn.no":
    {
      en: "No",
      ja: "いいえ"
    },
  "btn.ok":
    {
      en: "OK",
      ja: "OK"
    },
  "btn.cancel":
    {
      en: "Cancel",
      ja: "キャンセル"
    },
  "btn.edit":
    {
      en: "Edit",
      ja: "編集"
    },
  "btn.rename":
    {
      en: "Rename",
      ja: "名前変更"
    },
  "btn.reproduce":
    {
      en: "Reproduce",
      ja: "複製"
    },
  "btn.add":
    {
      en: "Add",
      ja: "追加"
    },
  "btn.delete":
    {
      en: "Delete",
      ja: "削除"
    },
  "btn.upper":
    {
      en: "Shift upper",
      ja: "上へ"
    },
  "btn.lower":
    {
      en: "Shift lower",
      ja: "下へ"
    },
  "btn.close":
    {
      en: "Close",
      ja: "閉じる"
    },
  "btn.clear":
    {
      en: "Clear",
      ja: "クリア"
    },
  "btn.apply":
    {
      en: "Apply",
      ja: "適用"
    }
};

function t(key)
{
  var entry = t_h[key];
  if (entry) {
    return entry["ja"];
  } else {
    return null;
  }
}

function t_merge(hash)
{
  for (var key in hash) {
    t_h[key] = hash[key];
  }
}

