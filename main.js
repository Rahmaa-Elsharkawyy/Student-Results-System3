"use strict";

// المصفوفة الرئيسية التي يتم حفظ الطلاب بداخلها
const studentsList = [];
let nextStudentId = 1001;

// دالة مساعدة لحماية النصوص عند عرضها داخل HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return replacements[character];
  });
}

// كلاس الطالب
class Student {
  #id;
  #name;
  #grades;
  #attendance;

  constructor(id, name, grades, attendance) {
    this.#id = id;

    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("من فضلك أدخل اسم الطالب.");
    }
    this.#name = name.trim();

    // استخدام setters للتحقق من الدرجات ونسبة الحضور
    this.grades = grades;
    this.attendance = attendance;
  }

  // Getter لرقم الجلوس والاسم والدرجات والحضور
  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get grades() {
    return [...this.#grades];
  }

  get attendance() {
    return this.#attendance;
  }

  // Setter للتحقق من درجات المواد
  set grades(value) {
    if (!Array.isArray(value) || value.length !== 3) {
      throw new Error("يجب إدخال درجات المواد الثلاث.");
    }

    const checkedGrades = value.map((grade, index) => {
      if (grade === "" || grade === null || grade === undefined || !Number.isFinite(Number(grade))) {
        throw new Error(`من فضلك أدخل درجة صحيحة للمادة رقم ${index + 1}.`);
      }

      const numericGrade = Number(grade);
      if (numericGrade < 0 || numericGrade > 100) {
        throw new Error(`درجة المادة رقم ${index + 1} يجب أن تكون بين 0 و100.`);
      }

      return numericGrade;
    });

    this.#grades = checkedGrades;
  }

  // Setter للتحقق من نسبة الحضور
  set attendance(value) {
    if (value === "" || value === null || value === undefined || !Number.isFinite(Number(value))) {
      throw new Error("من فضلك أدخل نسبة الحضور.");
    }

    const numericAttendance = Number(value);
    if (numericAttendance < 0 || numericAttendance > 100) {
      throw new Error("نسبة الحضور يجب أن تكون بين 0 و100.");
    }

    this.#attendance = numericAttendance;
  }

  // حساب متوسط درجات المواد باستخدام reduce
  calculateAverage() {
    const total = this.#grades.reduce((sum, grade) => sum + grade, 0);
    return total / this.#grades.length;
  }

  // تحديد التقدير بالحروف
  getGrade() {
    const average = this.calculateAverage();

    if (average >= 90) return "A";
    else if (average >= 80) return "B";
    else if (average >= 70) return "C";
    else if (average >= 60) return "D";
    else if (average >= 50) return "E";
    else return "F";
  }

  // تحديد النتيجة النهائية بناءً على المتوسط والحضور
  getFinalResult() {
    if (this.calculateAverage() >= 50 && this.#attendance >= 75) {
      return "ناجح";
    } else {
      return "يحتاج مراجعة";
    }
  }
}

// الإمساك بعناصر الصفحة باستخدام getElementById
const studentForm = document.getElementById("studentForm");
const studentNameInput = document.getElementById("studentName");
const grade1Input = document.getElementById("grade1");
const grade2Input = document.getElementById("grade2");
const grade3Input = document.getElementById("grade3");
const attendanceInput = document.getElementById("attendance");
const errorBox = document.getElementById("errorBox");
const successBox = document.getElementById("successBox");
const studentsTableBody = document.getElementById("studentsTableBody");
const studentsTableWrap = document.getElementById("studentsTableWrap");
const emptyState = document.getElementById("emptyState");
const mercyButton = document.getElementById("mercyButton");
const reportBox = document.getElementById("reportBox");

// تنسيق الرقم لعرضه حتى منزلتين عشريتين
function formatNumber(number) {
  return Number(number).toFixed(2).replace(/\.00$/, "");
}

// تحديث جدول الطلاب والإحصائيات
function renderStudents() {
  studentsTableBody.innerHTML = "";

  if (studentsList.length === 0) {
    studentsTableWrap.classList.add("d-none");
    emptyState.classList.remove("d-none");
  } else {
    emptyState.classList.add("d-none");
    studentsTableWrap.classList.remove("d-none");

    studentsList.forEach((student) => {
      const average = student.calculateAverage();
      const result = student.getFinalResult();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${escapeHTML(student.id)}</td>
        <td class="fw-bold">${escapeHTML(student.name)}</td>
        <td>${formatNumber(average)}%</td>
        <td><span class="grade-badge">${escapeHTML(student.getGrade())}</span></td>
        <td>
          <span class="status-badge ${result === "ناجح" ? "status-pass" : "status-review"}">
            ${escapeHTML(result)}
          </span>
        </td>
      `;
      studentsTableBody.appendChild(row);
    });
  }

  const passedCount = studentsList.filter(student => student.getFinalResult() === "ناجح").length;
  const reviewCount = studentsList.length - passedCount;
  const totalAverage = studentsList.reduce((sum, student) => sum + student.calculateAverage(), 0);

  document.getElementById("totalStudents").textContent = studentsList.length;
  document.getElementById("passedStudents").textContent = passedCount;
  document.getElementById("reviewStudents").textContent = reviewCount;
  document.getElementById("overallAverage").textContent =
    studentsList.length > 0 ? `${formatNumber(totalAverage / studentsList.length)}%` : "—";
  document.getElementById("studentsCount").textContent =
    `${studentsList.length} ${studentsList.length === 1 ? "طالب" : "طلاب"}`;
}

// تفريغ حقول الإدخال بعد إضافة الطالب بنجاح
function clearInputs() {
  studentForm.reset();
  studentNameInput.focus();
}

// إضافة طالب عند إرسال النموذج
studentForm.addEventListener("submit", function (event) {
  event.preventDefault();
  errorBox.textContent = "";
  errorBox.classList.add("d-none");
  successBox.classList.add("d-none");

  try {
    const name = studentNameInput.value;
    const grades = [
      grade1Input.value,
      grade2Input.value,
      grade3Input.value
    ];
    const attendance = attendanceInput.value;

    // إنشاء كائن جديد من كلاس Student
    const newStudent = new Student(nextStudentId, name, grades, attendance);

    // إضافة الطالب للمصفوفة بعد نجاح التحقق
    studentsList.push(newStudent);
    nextStudentId++;

    renderStudents();
    clearInputs();

    successBox.textContent = `تمت إضافة الطالب ${newStudent.name} بنجاح. رقم الجلوس: ${newStudent.id}`;
    successBox.classList.remove("d-none");

    // التقرير السابق يصبح غير محدث بعد إضافة طالب جديد
    reportBox.innerHTML = `
      <div class="empty-icon">📋</div>
      <p class="mb-0">تم تحديث قائمة الطلاب. اضغط «تفعيل لجنة الرأفة» لإنشاء تقرير جديد.</p>
    `;
    reportBox.classList.add("report-placeholder");
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove("d-none");
  }
});

// تفعيل لجنة الرأفة
mercyButton.addEventListener("click", function () {
  // Filter: استخراج الطلاب الذين متوسطهم من 40 إلى 49
  const strugglingStudents = studentsList.filter((student) => {
    const average = student.calculateAverage();
    return average >= 40 && average <= 49;
  });

  // Map: إضافة 5 درجات إلى متوسط كل طالب متعثر
  const mercyResults = strugglingStudents.map((student) => {
    const oldAverage = student.calculateAverage();
    const newAverage = oldAverage + 5;

    return {
      id: student.id,
      name: student.name,
      oldAverage: oldAverage,
      newAverage: newAverage
    };
  });

  // Reduce: جمع المتوسطات بعد إضافة درجات الرأفة
  const totalAfterMercy = mercyResults.reduce((sum, student) => {
    return sum + student.newAverage;
  }, 0);

  // منع القسمة على صفر إذا لم يوجد طلاب متعثرون
  const averageAfterMercy = mercyResults.length > 0
    ? totalAfterMercy / mercyResults.length
    : 0;

  if (mercyResults.length === 0) {
    reportBox.className = "report-placeholder";
    reportBox.innerHTML = `
      <div class="empty-icon">🎓</div>
      <h3 class="h6 fw-bold text-dark">لا يوجد طلاب تنطبق عليهم شروط لجنة الرأفة</h3>
      <p class="mb-0 small">يشترط أن يكون متوسط الطالب من 40 إلى 49 قبل إضافة درجات الرأفة.</p>
      <div class="report-note">عدد الطلاب المتعثرين: 0 — لا يمكن حساب متوسط لعدم وجود حالات.</div>
    `;
    return;
  }

  // عرض التقرير باستخدام Template Literals
  const studentsRows = mercyResults.map((student) => `
    <tr>
      <td>${escapeHTML(student.id)}</td>
      <td class="fw-bold">${escapeHTML(student.name)}</td>
      <td>${formatNumber(student.oldAverage)}%</td>
      <td class="text-success fw-bold">${formatNumber(student.newAverage)}%</td>
    </tr>
  `).join("");

  reportBox.className = "report-content";
  reportBox.innerHTML = `
    <div class="report-summary">
      <div class="report-metric">
        <span>عدد الطلاب المتعثرين</span>
        <strong>${mercyResults.length}</strong>
      </div>
      <div class="report-metric">
        <span>المتوسط العام بعد الرأفة</span>
        <strong>${formatNumber(averageAfterMercy)}%</strong>
      </div>
    </div>

    <h3 class="h6 fw-bold mb-3">تفاصيل الطلاب المشمولين بالرأفة</h3>
    <div class="table-responsive">
      <table class="mercy-table">
        <thead>
          <tr>
            <th>رقم الجلوس</th>
            <th>اسم الطالب</th>
            <th>قبل الرأفة</th>
            <th>بعد الرأفة</th>
          </tr>
        </thead>
        <tbody>${studentsRows}</tbody>
      </table>
    </div>
    <p class="report-note mb-0">تمت إضافة 5 درجات إلى متوسط كل طالب تنطبق عليه شروط اللجنة. هذا التقرير لا يغيّر الدرجات الأصلية المخزنة للطالب.</p>
  `;
});

// عرض حالة البداية عند فتح الصفحة
renderStudents();
