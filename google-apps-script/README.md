# お問い合わせフォーム - Google Apps Script セットアップ手順

このフォルダには、お問い合わせフォームからのメール送信機能を実装するためのGoogle Apps Scriptが含まれています。

## 📋 必要なもの

- Googleアカウント
- 送信先メールアドレス: `globalbunny77@gmail.com`

## 🚀 セットアップ手順

### ステップ1: Google Apps Scriptプロジェクトを作成

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「桔梗野バイオレッツ お問い合わせフォーム」に変更

### ステップ2: コードをコピー

1. 左側の `Code.gs` ファイルをクリック
2. `contact-form.gs` ファイルの内容をすべてコピー
3. Google Apps Scriptエディタに貼り付け（既存のコードは削除）
4. 💾 保存アイコンをクリック

### ステップ3: デプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で⚙️歯車アイコン→「ウェブアプリ」を選択
3. 以下の設定を行う：
   - **説明**: 「お問い合わせフォーム v1.0」
   - **次のユーザーとして実行**: 自分のアカウント
   - **アクセスできるユーザー**: 「全員」
4. 「デプロイ」ボタンをクリック
5. 初回は権限の承認が必要です：
   - 「アクセスを承認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」をクリック
   - 「許可」をクリック

### ステップ4: ウェブアプリURLをコピー

1. デプロイが完了すると、「ウェブアプリのURL」が表示されます
2. このURLをコピーしてください
   - 例: `https://script.google.com/macros/s/AKfycby...../exec`

### ステップ5: フロントエンドに設定

1. `src/app.component.ts` ファイルを開く
2. `GAS_ENDPOINT` 変数を探す（約102行目）
3. `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'` を、コピーしたURLに置き換える

```typescript
// 変更前
const GAS_ENDPOINT = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// 変更後（例）
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby...../exec';
```

4. ファイルを保存

## 📧 メール送信先の変更

メール送信先を変更する場合：

1. Google Apps Scriptエディタで `contact-form.gs` を開く
2. 2行目の `RECIPIENT_EMAIL` を編集

```javascript
const RECIPIENT_EMAIL = 'your-email@example.com'; // ここを変更
```

3. 保存して再デプロイ（「デプロイ」→「デプロイを管理」→「編集」→「バージョン: 新バージョン」→「デプロイ」）

## 📊 お問い合わせ履歴をスプレッドシートに保存（オプション）

お問い合わせ内容をGoogleスプレッドシートに自動保存することもできます：

1. [Googleスプレッドシート](https://sheets.google.com/)で新しいスプレッドシートを作成
2. 1行目に以下の見出しを入力：
   - A1: `日時`
   - B1: `お名前`
   - C1: `メールアドレス`
   - D1: `件名`
   - E1: `メッセージ`
3. スプレッドシートのURLからIDをコピー
   - URL: `https://docs.google.com/spreadsheets/d/【この部分がID】/edit`
4. Google Apps Scriptの `logToSpreadsheet` 関数内のコメントを外す
5. `YOUR_SPREADSHEET_ID_HERE` を実際のIDに置き換える

```javascript
const SPREADSHEET_ID = '実際のスプレッドシートID';
const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

sheet.appendRow([
  Utilities.formatDate(timestamp, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'),
  name,
  email,
  subject,
  message
]);
```

## ✅ テスト方法

### 1. GETリクエストでテスト

ブラウザでウェブアプリURLにアクセスすると、以下のJSONが表示されるはずです：

```json
{
  "status": "OK",
  "message": "桔梗野バイオレッツ お問い合わせフォーム API",
  "version": "1.0"
}
```

### 2. 実際のフォームでテスト

1. ウェブサイトのお問い合わせフォームにアクセス
2. テストデータを入力して送信
3. `globalbunny77@gmail.com` に確認メールが届くことを確認

## 🔧 トラブルシューティング

### メールが届かない場合

1. **スパムフォルダを確認**
   - Gmailの「迷惑メール」フォルダをチェック

2. **Google Apps Scriptの実行ログを確認**
   - エディタ左側の「実行数」をクリック
   - エラーメッセージを確認

3. **権限を再確認**
   - デプロイ設定で「アクセスできるユーザー: 全員」になっているか確認

### フォーム送信エラーの場合

1. **ブラウザのコンソールを確認**
   - F12キーでデベロッパーツールを開く
   - Consoleタブでエラーメッセージを確認

2. **URLが正しいか確認**
   - `src/app.component.ts`のGAS_ENDPOINTが正しいURLになっているか

3. **CORSエラーの場合**
   - Google Apps Scriptは`mode: 'no-cors'`で正常に動作します
   - 現在のコードで問題ありません

## 📝 仕様

### 送信されるメール形式

- **件名**: `【お問い合わせ】{ユーザーが入力した件名} - 桔梗野バイオレッツ少年野球チーム`
- **送信元**: 桔梗野バイオレッツ少年野球チーム
- **返信先**: お問い合わせ者のメールアドレス（返信ボタンで直接返信可能）
- **形式**: HTML形式（見やすいデザイン）+ テキスト形式

### 含まれる情報

- お名前
- メールアドレス
- 件名
- メッセージ
- 受信日時

## 🔐 セキュリティ

- Google Apps Scriptは自動的にHTTPS通信を使用
- 送信データは暗号化されて転送されます
- スパム対策として、必要に応じてreCAPTCHAの追加を検討してください

## 📞 サポート

問題が解決しない場合は、Google Apps Scriptの公式ドキュメントを参照してください：
- [Google Apps Script ドキュメント](https://developers.google.com/apps-script)
- [GmailApp リファレンス](https://developers.google.com/apps-script/reference/gmail/gmail-app)
