const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  // 1. อ่าน Source Code (รวมถึง util.js ถ้ามี)
  let sourceCode = "";
  try {
    sourceCode += "--- src/dashboard.js ---\n";
    sourceCode += fs.readFileSync('src/dashboard.js', 'utf8') + "\n";
    if (fs.existsSync('src/util.js')) {
      sourceCode += "--- src/util.js ---\n";
      sourceCode += fs.readFileSync('src/util.js', 'utf8');
    }
  } catch (e) {
    console.error("Error reading source code:", e.message);
  }

  // 2. อ่านผล Test (จากไฟล์ที่ Workflow สร้างไว้)
  let testOutput = "Automated Test Failed to Run/Crash";
  try {
    if (fs.existsSync('test_output.txt')) {
      testOutput = fs.readFileSync('test_output.txt', 'utf8');
    }
  } catch (e) { /* ignore */ }

  // 3. Prompt ภาษาไทย (เกณฑ์ 7 ข้อ)
  const prompt = `
  คุณคือ Senior Tech Lead ชาวไทยที่กำลัง Code Review ผู้สมัครงานตำแหน่ง Backend Developer
  โจทย์คือ: แก้ไขโค้ดดึงข้อมูล Dashboard (Node.js) ให้ทำงานเร็วขึ้น (Parallel) และทนทานต่อ API ที่ล่มบ่อย (Retry Logic)

  **ข้อมูลสำหรับการตรวจ:**
  1. Source Code ผู้สมัคร:
  ${sourceCode}

  2. Automated Test Log (ผลการรันจริง):
  ${testOutput}

  **เกณฑ์การให้คะแนน (7 ด้าน ด้านละ 10 คะแนนเต็ม รวมเฉลี่ยเป็นเต็ม 10):**
  1. **Correctness (ความถูกต้อง):** ข้อมูลครบไหม? Unit Test ผ่านไหม? (ถ้า Test แดงเถือก หักหนักๆ)
  2. **Error Handling (การรับมือปัญหา):** มี Retry ไหม? ดัก Catch Error ครบไหม?
  3. **Code Quality (คุณภาพโค้ด):** Clean Code? ตั้งชื่อตัวแปรดี? อ่านง่าย?
  4. **Performance (ประสิทธิภาพ):** ใช้ Promise.all/allSettled เพื่อความเร็วหรือไม่? (ถ้าทำทีละบรรทัด หักคะแนน)
  5. **Security (ความปลอดภัย):** ระวัง Infinite Loop ตอน Retry ไหม? ไม่ปล่อย Error Stack Trace ให้ User เห็น?
  6. **Consistency (ความสม่ำเสมอ):** Style การเขียน, Indentation, การใช้ async/await
  7. **Extensibility (การต่อยอด):** แยกฟังก์ชัน Retry เป็น Utility หรือ Hardcode?

  **รูปแบบการตอบกลับ (Output Format):**
  - ตอบเป็น **ภาษาไทย** สุภาพแต่ตรงไปตรงมา
  - ให้คะแนนแยกรายข้อ และคำนวณเกรดเฉลี่ยรวม
  
  ---
  ## 📝 ผลการประเมินโค้ด (Senior Review)

  **บทสรุป:** (วิจารณ์ภาพรวม 2-3 บรรทัด)

  **คะแนนรายหัวข้อ:**
  1. 🎯 Correctness: [X]/10
  2. 🛡️ Error Handling: [X]/10
  3. 💎 Code Quality: [X]/10
  4. ⚡ Performance: [X]/10
  5. 🔒 Security: [X]/10
  6. 📏 Consistency: [X]/10
  7. 🧩 Extensibility: [X]/10

  ### 🏆 คะแนนเฉลี่ยรวม: [X.X]/10

  **✅ จุดเด่น:**
  - ...
  
  **❌ จุดที่ต้องแก้ไข:**
  - ...

  **💡 คำแนะนำจากรุ่นพี่:**
  - ...
  ---
  `;

  // 4. เรียก Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(text); // ปริ้นลง Console ให้ครูอ่าน

  } catch (error) {
    console.error("Gemini API Error:", error);
    process.exit(1);
  }
}

run();
