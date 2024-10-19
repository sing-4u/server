export const createHtml = (code: string) => {
  return `
    <body style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2b2b2b;">이메일을 확인하기 위해<br>아래 인증 번호를 입력해 주세요.</h2>
        
        <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; letter-spacing: 3px; color: #2b2b2b;">
            ${code}
        </div>
        
        <div style="color: #666; font-size: 14px; margin: 20px 0; padding: 15px; background-color: #f8f8f8; border-radius: 4px;">
            비밀번호를 변경하고 싶지 않거나 본인이 요청한 것이 아닌 경우, 본 메일은 무시해 주세요.
        </div>
        
        <div style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            자동 생성된 이메일입니다. 이 이메일 주소에 회신하는 경우 답변을 드릴 수 없습니다.<br><br>
            문의가 있는 경우에 아래 이메일 주소로 문의 부탁드립니다.<br>
            sing4uofficial@gmail.com
        </div>
    </div>
</body>
  `;
};
