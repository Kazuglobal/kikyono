/**
 * 桔梗野バイオレッツ少年野球チーム お問い合わせフォーム用 Google Apps Script
 *
 * Webアプリとしてデプロイし、発行されたURLを
 * src/components/footer/footer.component.ts の gasEndpoint に設定してください。
 */

const RECIPIENT_EMAIL = 'globalbunny77@gmail.com';
const TEAM_NAME = '桔梗野バイオレッツ少年野球チーム';

function doPost(e) {
  try {
    const data = getRequestData(e);
    const timestamp = new Date();
    const requestId = value(data.requestId) || `gas-${timestamp.getTime()}`;

    Logger.log(JSON.stringify({
      event: 'contact_form_received',
      requestId,
      contentType: e && e.postData ? e.postData.type : '',
      keys: Object.keys(data),
    }));

    const guardianName = value(data.guardianName);
    const childName = value(data.childName);
    const grade = value(data.grade);
    const email = value(data.email);
    const phone = value(data.phone);
    const inquiryType = value(data.inquiryType);
    const preferredDate = value(data.preferredDate);
    const baseballExperience = value(data.baseballExperience);
    const message = value(data.message);
    const consent = value(data.consent);

    const subject = `【体験・見学お問い合わせ】${inquiryType || 'お問い合わせ'} - ${guardianName || TEAM_NAME}`;
    const receivedAt = Utilities.formatDate(timestamp, 'Asia/Tokyo', 'yyyy年MM月dd日 HH:mm:ss');

    const textBody = `${TEAM_NAME}のLPからお問い合わせがありました。

━━━━━━━━━━━━━━━━━━━━
■ 保護者・お子さま情報
━━━━━━━━━━━━━━━━━━━━
保護者のお名前: ${guardianName}
お子さまのお名前: ${childName}
学年: ${grade}

━━━━━━━━━━━━━━━━━━━━
■ ご連絡先
━━━━━━━━━━━━━━━━━━━━
メールアドレス: ${email}
電話番号: ${phone}

━━━━━━━━━━━━━━━━━━━━
■ お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━
希望内容: ${inquiryType}
希望参加日: ${preferredDate}
野球経験: ${baseballExperience}
同意確認: ${consent}

メッセージ:
${message}

━━━━━━━━━━━━━━━━━━━━
受信日時: ${receivedAt}
受付ID: ${requestId}
━━━━━━━━━━━━━━━━━━━━

このメールは ${TEAM_NAME} の公式LPから自動送信されています。`;

    const htmlBody = buildHtmlBody({
      guardianName,
      childName,
      grade,
      email,
      phone,
      inquiryType,
      preferredDate,
      baseballExperience,
      consent,
      message,
      receivedAt,
      requestId,
    });

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject,
      body: textBody,
      htmlBody,
      name: TEAM_NAME,
      replyTo: email || RECIPIENT_EMAIL,
    });

    Logger.log(JSON.stringify({
      event: 'contact_form_mail_sent',
      requestId,
      recipient: RECIPIENT_EMAIL,
      remainingQuota: MailApp.getRemainingDailyQuota(),
    }));

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'お問い合わせを受け付けました。',
        requestId,
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(JSON.stringify({
      event: 'contact_form_error',
      message: String(error),
      stack: error && error.stack ? error.stack : '',
    }));

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: `送信処理でエラーが発生しました: ${error}`,
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: `${TEAM_NAME} contact form endpoint`,
      recipient: RECIPIENT_EMAIL,
      remainingQuota: MailApp.getRemainingDailyQuota(),
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendTestEmail() {
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年MM月dd日 HH:mm:ss');

  MailApp.sendEmail({
    to: RECIPIENT_EMAIL,
    subject: `【テスト送信】${TEAM_NAME} お問い合わせフォーム`,
    body: `${TEAM_NAME} のGoogle Apps Scriptからのテストメールです。\n\n送信日時: ${timestamp}`,
    name: TEAM_NAME,
  });

  Logger.log(JSON.stringify({
    event: 'contact_form_test_mail_sent',
    recipient: RECIPIENT_EMAIL,
    remainingQuota: MailApp.getRemainingDailyQuota(),
  }));

  return `テストメールを ${RECIPIENT_EMAIL} に送信しました。送信日時: ${timestamp}`;
}

function getRequestData(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return normalizeParameterObject(e.parameter);
  }

  const contents = e && e.postData && e.postData.contents;
  if (!contents) {
    return {};
  }

  try {
    return JSON.parse(contents);
  } catch (error) {
    return parseFormEncoded(contents);
  }
}

function normalizeParameterObject(parameters) {
  return Object.keys(parameters).reduce((acc, key) => {
    const item = parameters[key];
    acc[key] = Array.isArray(item) ? item[0] : item;
    return acc;
  }, {});
}

function parseFormEncoded(contents) {
  return contents.split('&').reduce((acc, pair) => {
    const separatorIndex = pair.indexOf('=');
    const rawKey = separatorIndex >= 0 ? pair.slice(0, separatorIndex) : pair;
    const rawValue = separatorIndex >= 0 ? pair.slice(separatorIndex + 1) : '';
    const key = decodeFormComponent(rawKey);
    if (key) {
      acc[key] = decodeFormComponent(rawValue);
    }
    return acc;
  }, {});
}

function decodeFormComponent(input) {
  return decodeURIComponent(String(input || '').replace(/\+/g, ' '));
}

function buildHtmlBody(data) {
  const rows = [
    ['保護者のお名前', data.guardianName],
    ['お子さまのお名前', data.childName],
    ['学年', data.grade],
    ['メールアドレス', data.email],
    ['電話番号', data.phone],
    ['希望内容', data.inquiryType],
    ['希望参加日', data.preferredDate],
    ['野球経験', data.baseballExperience],
    ['同意確認', data.consent],
    ['お問い合わせ内容', data.message],
  ];

  const fields = rows.map(([label, content]) => `
    <tr>
      <th>${escapeHtml(label)}</th>
      <td>${escapeHtml(content).replace(/\n/g, '<br>')}</td>
    </tr>
  `).join('');

  return `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { margin: 0; background: #f5f2fb; color: #251247; font-family: Arial, 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif; }
      .wrap { max-width: 720px; margin: 0 auto; padding: 24px; }
      .header { padding: 22px 24px; border-radius: 14px 14px 0 0; background: linear-gradient(135deg, #5a2d91, #251247); color: #fff; }
      .header h1 { margin: 0; font-size: 22px; }
      .header p { margin: 6px 0 0; color: #d8f35f; font-weight: bold; }
      .content { padding: 22px; background: #fff; border: 1px solid #e4ddec; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 13px 12px; border-bottom: 1px solid #eee8f3; vertical-align: top; text-align: left; }
      th { width: 180px; color: #5a2d91; background: #faf7ff; }
      td { color: #251247; white-space: normal; }
      .footer { padding: 14px 22px; border-radius: 0 0 14px 14px; background: #1d1f27; color: #c8c3d2; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>体験・見学お問い合わせ</h1>
        <p>${escapeHtml(TEAM_NAME)}</p>
      </div>
      <div class="content">
        <table>${fields}</table>
      </div>
      <div class="footer">
        受信日時: ${escapeHtml(data.receivedAt)}<br>
        受付ID: ${escapeHtml(data.requestId)}<br>
        このメールは公式LPから自動送信されています。
      </div>
    </div>
  </body>
</html>`;
}

function value(input) {
  return input == null ? '' : String(input).trim();
}

function escapeHtml(input) {
  return value(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
