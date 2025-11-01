/**
 * 桔梗野バイオレッツ お問い合わせフォーム用 Google Apps Script
 *
 * セットアップ手順:
 * 1. https://script.google.com/ にアクセス
 * 2. 新しいプロジェクトを作成
 * 3. このコードをコピー＆ペースト
 * 4. 「デプロイ」→「新しいデプロイ」
 * 5. 種類: 「ウェブアプリ」を選択
 * 6. 「次のユーザーとして実行」: 自分
 * 7. 「アクセスできるユーザー」: 全員
 * 8. デプロイして、ウェブアプリのURLをコピー
 * 9. そのURLをsrc/app.component.tsのGAS_ENDPOINT変数に設定
 */

// 送信先メールアドレス
const RECIPIENT_EMAIL = 'globalbunny77@gmail.com';
const TEAM_NAME = '桔梗野バイオレッツ少年野球チーム';

/**
 * POSTリクエストを処理する関数
 */
function doPost(e) {
  try {
    // リクエストボディからデータを取得
    const data = JSON.parse(e.postData.contents);

    // フォームデータを取得
    const name = data.name || '';
    const email = data.email || '';
    const subject = data.subject || '';
    const message = data.message || '';
    const timestamp = new Date();

    // メール件名
    const emailSubject = `【お問い合わせ】${subject} - ${TEAM_NAME}`;

    // メール本文
    const emailBody = `
${TEAM_NAME}のウェブサイトからお問い合わせがありました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【お名前】
${name}

【メールアドレス】
${email}

【件名】
${subject}

【メッセージ】
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 受信情報
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

受信日時: ${Utilities.formatDate(timestamp, 'Asia/Tokyo', 'yyyy年MM月dd日 HH:mm:ss')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

このメールは ${TEAM_NAME} の公式ウェブサイトから自動送信されています。
`;

    // HTML形式のメール本文
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #7c3aed; margin-bottom: 5px; }
    .field-value { background-color: white; padding: 12px; border-left: 3px solid #7c3aed; border-radius: 4px; }
    .footer { background-color: #1e293b; color: #94a3b8; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
    .timestamp { color: #64748b; font-size: 14px; margin-top: 20px; text-align: right; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">📧 新しいお問い合わせ</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px;">${TEAM_NAME}</p>
    </div>

    <div class="content">
      <div class="field">
        <div class="field-label">👤 お名前</div>
        <div class="field-value">${name}</div>
      </div>

      <div class="field">
        <div class="field-label">📧 メールアドレス</div>
        <div class="field-value"><a href="mailto:${email}">${email}</a></div>
      </div>

      <div class="field">
        <div class="field-label">📌 件名</div>
        <div class="field-value">${subject}</div>
      </div>

      <div class="field">
        <div class="field-label">💬 メッセージ</div>
        <div class="field-value" style="white-space: pre-wrap;">${message}</div>
      </div>

      <div class="timestamp">
        受信日時: ${Utilities.formatDate(timestamp, 'Asia/Tokyo', 'yyyy年MM月dd日 HH:mm:ss')}
      </div>
    </div>

    <div class="footer">
      このメールは ${TEAM_NAME} の公式ウェブサイトから自動送信されています。
    </div>
  </div>
</body>
</html>
`;

    // メール送信
    GmailApp.sendEmail(
      RECIPIENT_EMAIL,
      emailSubject,
      emailBody,
      {
        htmlBody: htmlBody,
        name: TEAM_NAME,
        replyTo: email // 返信先を送信者のメールアドレスに設定
      }
    );

    // スプレッドシートに記録（オプション）
    logToSpreadsheet(name, email, subject, message, timestamp);

    // 成功レスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'お問い合わせを受け付けました'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーレスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'エラーが発生しました: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * スプレッドシートに記録する関数（オプション）
 * スプレッドシートIDを設定すると、お問い合わせ履歴を記録できます
 */
function logToSpreadsheet(name, email, subject, message, timestamp) {
  try {
    // スプレッドシートIDを設定してください（オプション）
    // const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    // const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    // 以下のコードのコメントを外して使用してください
    /*
    sheet.appendRow([
      Utilities.formatDate(timestamp, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss'),
      name,
      email,
      subject,
      message
    ]);
    */
  } catch (error) {
    Logger.log('スプレッドシート記録エラー: ' + error.toString());
  }
}

/**
 * GETリクエスト用（テスト用）
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: '桔梗野バイオレッツ お問い合わせフォーム API',
      version: '1.0'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
