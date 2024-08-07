function generateDateRanges(selectDate) {
    let date = new Date();

    if (
        (date.getHours() == 20 && date.getMinutes() >= 30) ||
        date.getHours() > 20
    ) {
        date.setDate(date.getDate() + 1);

        if (date.getDay() == 6) {
            date.setDate(date.getDate() + 1);
        }
    }

    let dateOptions = {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    for (let i = 0; i < 8; i++) {
        if (date.getDay() == 0) {
            date.setDate(date.getDate() + 1);
        }

        let option = document.createElement("option");
        option.text = date.toLocaleDateString("en", dateOptions);
        option.value = date;

        selectDate.add(option);

        date.setDate(date.getDate() + 1);
    }
}

function generateTimeRanges(selectTime, setTime) {
    selectTime.innerHTML = "";

    let start = new Date(setTime);

    if (
        start.getHours() < 7 ||
        (start.getHours() == 7 && start.getMinutes() < 30)
    ) {
        start.setHours(7, 30);
    }

    if (
        (start.getHours() == 20 && start.getMinutes() >= 30) ||
        start.getHours() >= 21
    ) {
        start.setDate(start.getDate() + 1);
        start.setHours(7, 30);
    }

    if (start.getDay() === 0) {
        start.setDate(start.getDate() + 1);
        start.setHours(7, 30);
    }

    if (start.getMinutes() <= 30) {
        start.setMinutes(30);
    } else {
        start.setHours(start.getHours() + 1, 0);
    }

    let end = new Date(start);
    end.setHours(21, 0);

    let blank = document.createElement("option");
    blank.value = "no";
    blank.text = "-:-- -- - -:-- --";

    selectTime.appendChild(blank);

    while (start < end) {
        let nextTime = new Date(start.getTime());
        nextTime.setMinutes(nextTime.getMinutes() + 30);
        let hour = start.getHours();
        let minutes = start.getMinutes();
        let nextHour = nextTime.getHours();
        let nextMinutes = nextTime.getMinutes();
        let ampm = hour >= 12 ? "PM" : "AM";
        let nextAMPM = nextHour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        hour = hour ? hour : 12;
        nextHour = nextHour % 12;
        nextHour = nextHour ? nextHour : 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        nextMinutes = nextMinutes < 10 ? "0" + nextMinutes : nextMinutes;
        let strTime =
            hour +
            ":" +
            minutes +
            " " +
            ampm +
            " - " +
            nextHour +
            ":" +
            nextMinutes +
            " " +
            nextAMPM;

        let option = document.createElement("option");
        option.value =
            start.getHours() +
            ":" +
            start.getMinutes() +
            ":" +
            nextTime.getHours() +
            ":" +
            nextTime.getMinutes();
        option.text = strTime;

        selectTime.appendChild(option);

        start.setMinutes(start.getMinutes() + 30);
    }
}

function reset() {
    $(".chair")
        .not(".user_chair, .anon_chair, .reserved_chair")
        .css("background-color", "#2E8B57");
    $(".anon_checkbox").prop("checked", false);
}

function resetReservation() {
    $(".chair")
        .not(".user_chair, .anon_chair, .reserved_chair")
        .css("background-color", "#2E8B57");
    $(".reserved_chair").css("background-color", "#DAA520");
    $(".edit_btn").show();
    $(".cancel_btn").hide();
    $(".save_btn").hide().prop("disabled", true);
    $(".anon_checkbox_res").hide();
    $(".anon_checkbox").prop("checked", false);
    $("img.chair[id$='-reserved']:not(.user_chair):not(.anon_chair)").off(
        "click"
    );
}

function editReservation() {
    $("img.chair[id$='-reserved']:not(.user_chair):not(.anon_chair)").click(
        function () {
            selectSeat(this.id);
        }
    );
    $(".edit_btn").hide();
    $(".save_btn").show();
    $(".cancel_btn").show();
    $(".anon_checkbox_res").show();
}

function cancelReservation() {
    $(".edit_btn").show();
    $(".save_btn").hide();
    $(".cancel_btn").hide();
    $(".anon_checkbox_res").hide();
    resetReservation();
}

function editProfile(url) {
    let profile = String(url);
    if ($("#desc").prop("disabled")) {
        $("#desc").prop("disabled", false);
        $("#urledit").css("display", "block");
        $("#url").val(profile);
        $("#edit_profile").hide();
        $("#save_profile").show();
    } else {
        $("#desc").prop("disabled", true);
        $("#urledit").css("display", "none");
        $("#edit_profile").show();
        $("#save_profile").hide();
    }
}

function deleteReservation(lab, time, date) {
    window.location.href = `/delete-reservation?lab=${lab}&date=${date}&time=${time}`;
}
function deleteReservationTech(lab, time, date, name) {
    window.location.href = `/delete-reservation-tech?lab=${lab}&date=${date}&time=${time}&name=${name}`;
}

function deleteFAQ(id) {
    window.location.href = `/delete-faq?id=${id}`;
}

function reserve(slotNum) {
    $("#seats-" + slotNum).text("");
    $("#seats-" + slotNum + "-reserved").text("");
    for (var i = 1; i <= 45; i++) {
        if (
            $("#chair-" + slotNum + "-" + i).css("background-color") ===
            "rgb(218, 165, 32)"
        ) {
            $("#seats-" + slotNum).append("S" + i + ", ");
        }
        if (
            $("#chair-" + slotNum + "-" + i + "-reserved").css("background-color") ===
            "rgb(218, 165, 32)"
        ) {
            $("#seats-" + slotNum + "-reserved").append("S" + i + ", ");
        }
    }
    $("#seats-" + slotNum).text(
        $("#seats-" + slotNum)
            .text()
            .slice(0, -2)
    );
    $("#seats-" + slotNum + "-reserved").text(
        $("#seats-" + slotNum + "-reserved")
            .text()
            .slice(0, -2)
    );
    if (document.getElementById("anonymous" + slotNum)){
        if (document.getElementById("anonymous" + slotNum).checked) {
            $("#anon-" + slotNum).text("Yes");
        } else {
            $("#anon-" + slotNum).text("No");
        }
    }
    if (document.getElementById("anonymous" + slotNum + "-reserved")) {
        if (document.getElementById("anonymous" + slotNum + "-reserved").checked) {
            $("#anon-" + slotNum + "-reserved").text("Yes");
        } else {
            $("#anon-" + slotNum + "-reserved").text("No");
        }
    }
}

function confirmReservation(slotIndex, mode) {
    let lab, date, time, seats, anon;
    if (mode === "add") {
        lab = document.getElementById(`lab-${slotIndex}`).innerText;
        date = document.getElementById(`date-${slotIndex}`).innerText;
        time = document.getElementById(`time-${slotIndex}`).innerText;
        seats = document.getElementById(`seats-${slotIndex}`).innerText;
        anon = document.getElementById(`anon-${slotIndex}`).innerText;
    } else if (mode === "edit") {
        lab = document.getElementById(`lab-${slotIndex}-reserved`).innerText;
        date = document.getElementById(`date-${slotIndex}-reserved`).innerText;
        time = document.getElementById(`time-${slotIndex}-reserved`).innerText;
        seats = document.getElementById(`seats-${slotIndex}-reserved`).innerText;
        anon = document.getElementById(`anon-${slotIndex}-reserved`).innerText;
    }

    window.location.href = `/confirm-reservation?lab=${lab}&date=${date}&time=${time}&seats=${seats}&anon=${anon}`;
}

function confirmReservationTech(slotIndex, name, mode) {
    let lab, date, time, seats, anon;
    if (mode === "add") {
        lab = document.getElementById(`lab-${slotIndex}`).innerText;
        date = document.getElementById(`date-${slotIndex}`).innerText;
        time = document.getElementById(`time-${slotIndex}`).innerText;
        seats = document.getElementById(`seats-${slotIndex}`).innerText;
        anon = document.getElementById(`anon-${slotIndex}`).innerText;
    } else if (mode === "edit") {
        lab = document.getElementById(`lab-${slotIndex}-reserved`).innerText;
        date = document.getElementById(`date-${slotIndex}-reserved`).innerText;
        time = document.getElementById(`time-${slotIndex}-reserved`).innerText;
        seats = document.getElementById(`seats-${slotIndex}-reserved`).innerText;
        anon = document.getElementById(`anon-${slotIndex}-reserved`).innerText;
    }

    window.location.href = `/confirm-reservation-tech?lab=${lab}&date=${date}&time=${time}&seats=${seats}&anon=${anon}&name=${name}`;
}

function selectSeat(chair) {
    let element = document.getElementById(chair);
    let currentColor = window.getComputedStyle(element).backgroundColor;
    var chairClass = $(this).attr("class");
    var slotNum = null;
    var idParts = chair.split("-");
    slotNum = idParts[1];
    var enable = false;
    var enable_res = false;
    var foundYellow_res = false;

    if (currentColor === "rgb(46, 139, 87)") {
        element.style.backgroundColor = "#DAA520";
    } else if (currentColor === "rgb(218, 165, 32)") {
        element.style.backgroundColor = "#2E8B57";
    }
    for (var i = 1; i <= 45; i++) {
        var chairId = "#chair-" + slotNum + "-" + i;
        var chairColor = $(chairId).css("background-color");
        var chairId_res = "#chair-" + slotNum + "-" + i + "-reserved";
        var chairColor_res = $(chairId_res).css("background-color");
        var isRes = $(chairId_res).hasClass("reserved_chair");
        var isAnon = $(chairId_res).hasClass("anon_chair");
        var isUser = $(chairId_res).hasClass("user_chair");

        if (chairColor === "rgb(218, 165, 32)") {
            enable = true;
        }
        if (chairColor_res === "rgb(218, 165, 32)") {
            foundYellow_res = true;
        }
        if (
            (isRes && chairColor_res === "rgb(46, 139, 87)") ||
            (!isRes && !isAnon && !isUser && chairColor_res === "rgb(218, 165, 32)")
        ) {
            enable_res = true;
        }
    }
    if (enable) {
        $("#confirm_button-" + slotNum).prop("disabled", false);
    } else {
        $("#confirm_button-" + slotNum).prop("disabled", true);
    }
    if (enable_res && foundYellow_res) {
        $("#confirm_button-" + slotNum + "-reserved").prop("disabled", false);
    } else {
        $("#confirm_button-" + slotNum + "-reserved").prop("disabled", true);
    }
}

function increment(index) {
    return index + 1;
}
function desk(index) {
    return index % 9 === 0;
}
function space(index) {
    return (index + 1) % 3 === 0 && (index + 1) % 9 != 0;
}

function searchSlots(date, time, lab, name, isTech) {
    $.post(
        "fetch-slots",
        {
            date: date,
            hour_in: time[0],
            minute_in: time[1],
            hour_out: time[2],
            minute_out: time[3],
            lab: lab,
            name: name,
        },
        function (data, status) {
            let slots = data.slots;
            let isReserved = data.isReserved;
            let name = data.name;
            if (status === "success") {
                if (isReserved) {
                    const alertPlaceholder = document.getElementById('alert')
                    const appendAlert = (message, type) => {
                        const wrapper = document.createElement('div');
                        wrapper.classList.add('d-flex', 'justify-content-center');
                        wrapper.innerHTML = [
                            `<div class="alert alert-${type} w-50" role="alert" id="info-alert">`,
                            `   ${message}`,
                            '</div>'
                        ].join('')
                        alertPlaceholder.append(wrapper)
                    }
                    appendAlert('Currently have a reservation at the chosen time slot.', 'info');
                    $("#info-alert").fadeTo(2000, 500).slideUp(500, function () {
                        $("#info-alert").slideUp(500);
                        alertPlaceholder.innerHTML = "";
                    });
                }
                let div = document.getElementById("slots");
                div.innerHTML = "";

                let allSlots = "";
                slots = data.slots;
                for (let i = 0; i < slots.length; i++) {
                    let slot = "";
                    if (slots[i]["available"]) {
                        slot +=
                            `
                        <div class="slot shadow m-4 p-3" data-bs-toggle="modal" data-bs-target="#modal-` +
                            i +
                            `">
                        `;
                    } else {
                        slot +=
                            `
                        <div class="full_slot shadow m-4 p-3" data-bs-toggle="modal" data-bs-target="#modal-` +
                            i +
                            `">
                        `;
                    }

                    slot +=
                        `
                    <h1>` +
                        slots[i]["lab"] +
                        `</h1>
                        <b>Time:<br /></b>` +
                        slots[i]["time_in"] +
                        ` - ` +
                        slots[i]["time_out"] +
                        `<br />
                        <b>Date: </b>` +
                        slots[i]["date"] +
                        `<br />
                        <b>Seat/s Left: </b>` +
                        slots[i]["avail_seats"] +
                        `
                    </div>
                    <div class="modal fade" id="modal-` +
                        i +
                        `" data-bs-backdrop="static" data-bs-keyboard="true"
                        tabindex="-1">
                        <div class="modal-dialog modal-xl">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h1 class="modal-title fs-5">` +
                        slots[i]["lab"] +
                        `</h1>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="reset()"></button>
                                </div>
                                <div class="modal-body d-flex justify-content-center">
                                    <div>
                                        <div class="d-flex mb-3">
                                            <b>Date:</b>&nbsp` +
                        slots[i]["date"] +
                        `
                                            <div class="mx-auto"></div>
                                            <b>Time:</b>&nbsp` +
                        slots[i]["time_in"] +
                        ` - ` +
                        slots[i]["time_out"] +
                        `
                                        </div>
                                        <table>
                                            <tr>
                                                <td class="bg-secondary text-white rounded-3" colspan="11">Front</td>
                                            </tr>
                    `;

                    let seats = slots[i]["seats"];
                    for (let j = 0; j < seats.length; j++) {
                        let seat = seats[j];
                        if (desk(j)) {
                            slot += `
                            <tr>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td class="px-4"></td>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td class="px-4"></td>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td>
                                    <img class="desk" />
                                </td>
                                <td>
                                    <img class="desk" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                            `;
                            if (seat.reserved) {
                                if (seat.isAnonymous) {
                                    slot +=
                                        `
                                    <img class="chair anon_chair rounded-3" /><br>S` +
                                        increment(j) +
                                        `
                                    `;
                                } else {
                                    slot +=
                                        `
                                    <a tabindex="0" class="btn btn-sm" role="button"
                                        data-bs-container="#modal-` +
                                        i +
                                        ` .modal-body"
                                        data-bs-toggle="popover" data-bs-trigger="focus"
                                        data-bs-title="<a class='link-dark' href='../profile/` +
                                        seat.name +
                                        `'>
                                        <img src='` +
                                        seat.profile +
                                        `' id='profile-res' class='border border-success border-3 rounded-circle'></a>&nbsp
                                        <a class='link-dark' href='../profile/` +
                                        seat.name +
                                        `'>` +
                                        seat.fullname +
                                        `</a>" data-bs-html="true"
                                        data-bs-content="` +
                                        seat.description +
                                        `" data-bs-placement="top">
                                        <img class="chair user_chair rounded-3"
                                            id="chair-` +
                                        i +
                                        `-` +
                                        increment(j) +
                                        `" /><br>S` +
                                        increment(j) +
                                        `
                                    </a>
                                    `;
                                }
                            } else {
                                slot +=
                                    `
                                <img class="chair rounded-3"
                                    id="chair-` +
                                    i +
                                    `-` +
                                    increment(j) +
                                    `"
                                    onclick="selectSeat('chair-` +
                                    i +
                                    `-` +
                                    increment(j) +
                                    `')" /><br>S` +
                                    increment(j) +
                                    `
                                `;
                            }
                            slot += `
                            </td>
                            `;
                        } else {
                            slot += `
                            <td>
                            `;
                            if (seat.reserved) {
                                if (seat.isAnonymous) {
                                    slot +=
                                        `
                                    <img class="chair anon_chair rounded-3" /><br>S` +
                                        increment(j) +
                                        `
                                    `;
                                } else {
                                    slot +=
                                        `
                                    <a tabindex="0" class="btn btn-sm" role="button"
                                        data-bs-container="#modal-` +
                                        i +
                                        ` .modal-body"
                                        data-bs-toggle="popover" data-bs-trigger="focus"
                                        data-bs-title="<a class='link-dark' href='../profile/` +
                                        seat.name +
                                        `'>
                                        <img src='` +
                                        seat.profile +
                                        `' id='profile-res' class='border border-success border-3 rounded-circle'></a>&nbsp
                                        <a class='link-dark' href='../profile/` +
                                        seat.name +
                                        `'>` +
                                        seat.fullname +
                                        `</a>" data-bs-html="true"
                                        data-bs-content="` +
                                        seat.description +
                                        `" data-bs-placement="top">
                                        <img class="chair user_chair rounded-3"
                                            id="chair-` +
                                        i +
                                        `-` +
                                        increment(j) +
                                        `" /><br>S` +
                                        increment(j) +
                                        `
                                    </a>
                                    `;
                                }
                            } else {
                                slot +=
                                    `
                                <img class="chair rounded-3"
                                    id="chair-` +
                                    i +
                                    `-` +
                                    increment(j) +
                                    `"
                                    onclick="selectSeat('chair-` +
                                    i +
                                    `-` +
                                    increment(j) +
                                    `')" /><br>S` +
                                    increment(j) +
                                    `
                                `;
                            }
                            slot += `
                            </td>
                            `;
                        }
                        if (space(j)) {
                            slot += `
                            <td class="px-4"></td>
                            `;
                        }
                    }

                    slot += `
                            </table>
                        </div>
                    </div>
                    `;

                    if (slots[i]["available"]) {
                        slot +=
                            `
                        <div class="modal-footer d-flex justify-content-center">
                            <div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input anon_checkbox" type="checkbox" id="anonymous` +
                            i +
                            `"
                                        name="anonymous" />
                                    <label class="form-check-label" for="anonymous">Reserve Anonymously</label>
                                </div>
                                <div class="d-flex justify-content-center">
                                    <button type="button" class="btn btn-success" id="confirm_button-` +
                            i +
                            `"
                                        data-bs-toggle="modal" data-bs-target="#confirm-` +
                            i +
                            `"
                                        onclick="reserve(`+ i + `)" disabled>
                                        Reserve
                                    </button>
                                </div>
                            </div>
                        </div>
                        `;
                    }

                    slot +=
                        `
                            </div>
                        </div>
                    </div>
                    <div class="modal fade" id="confirm-` +
                        i +
                        `" data-bs-backdrop="static" data-bs-keyboard="true"
                    tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5">Confirm Reservation</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" onclick="reset()"></button>
                            </div>
                            <div class="modal-body">
                                <b>Laboratory: </b><span id="lab-` +
                        i +
                        `">` +
                        slots[i]["lab"] +
                        `</span><br />
                                <b>Date: </b><span id="date-` +
                        i +
                        `">` +
                        slots[i]["date"] +
                        `</span><br />
                                <b>Time: </b><span id="time-` +
                        i +
                        `">` +
                        slots[i]["time_in"] +
                        ` - ` +
                        slots[i]["time_out"] +
                        `</span><br />
                                <b>Seat/s Selected: </b><span id="seats-` +
                        i +
                        `"></span><br />
                                <b>Reserved Anonymously: </b> <span id="anon-` +
                        i +
                        `"></span><br />Confirm your
                                reservation?
                            </div>
                            <div class="modal-footer">`;
                    if (isTech) {
                        slot +=
                            `
                        <a class="btn btn-success" href="#" onclick="confirmReservationTech(` +
                            i +
                            `, '` +
                            name +
                            `', 'add')" role="button">Confirm</a>`;
                    } else {
                        slot +=
                            `
                        <a class="btn btn-success" href="#" onclick="confirmReservation(` +
                            i +
                            `, 'add')" role="button">Confirm</a>`;
                    }
                    slot += `
                            </div>
                        </div>
                    </div>
                </div>
                    `;

                    allSlots += slot;
                }
                div.innerHTML = allSlots;
                $(".chair").attr(
                    "src",
                    "https://cdn-icons-png.flaticon.com/256/99/99342.png"
                );
                $(".desk").attr(
                    "src",
                    "https://static.vecteezy.com/system/resources/previews/021/142/420/original/computer-table-monitor-top-view-color-icon-illustration-vector.jpg"
                );
                const popoverTriggerList = document.querySelectorAll(
                    '[data-bs-toggle="popover"]'
                );
                const popoverList = [...popoverTriggerList].map(
                    (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
                );
            }
        }
    );
}

$(document).ready(function () {
    $(".chair").attr(
        "src",
        "https://cdn-icons-png.flaticon.com/256/99/99342.png"
    );
    $(".desk").attr(
        "src",
        "https://static.vecteezy.com/system/resources/previews/021/142/420/original/computer-table-monitor-top-view-color-icon-illustration-vector.jpg"
    );

    let selectDate = document.getElementById("date");
    let selectTime = document.getElementById("time");
    let selectLab = document.getElementById("lab");
    let curName = document.getElementById("name");
    let curIsTech = document.getElementById("isTech");

    let now = new Date();

    generateDateRanges(selectDate);

    generateTimeRanges(selectTime, now);

    selectDate.addEventListener("change", function () {
        let now = new Date();
        let date = selectDate.value;
        let lab = selectLab.value;
        let name = {
            name: curName.value,
        };
        let time = [];
        let isTech = curIsTech.value === "true";
        let checkTime = selectTime.value;
        let checkDate = new Date(date);
        let start = new Date(now.getTime());
        if (now.getHours() < 7 || (now.getHours() == 7 && now.getMinutes() < 30)) {
            start.setHours(7, 30, 0, 0);
        }

        if (
            (now.getHours() == 20 && now.getMinutes() >= 30) ||
            now.getHours() >= 21
        ) {
            start.setDate(now.getDate() + 1);
            start.setHours(7, 30, 0, 0);
        }

        if (start.getDay() === 0) {
            start.setDate(start.getDate() + 1);
            start.setHours(7, 30, 0, 0);
        }

        if (start.getMinutes() <= 30) {
            start.setMinutes(30);
        } else {
            start.setHours(start.getHours() + 1, 0);
        }

        if (!(checkTime === "no")) {
            time = selectTime.value.split(":");
            if (
                time[0] < start.getHours() ||
                (time[0] == start.getHours() && time[1] < start.getMinutes())
            ) {
                alert("Invalid Search");
                time = [start.getHours(), start.getMinutes(), 21, 0];
            }
        } else {
            if (
                now.getDate() != checkDate.getDate() ||
                now.getMonth() != checkDate.getMonth()
            ) {
                time = [7, 30, 21, 0];
            } else {
                time = [start.getHours(), start.getMinutes(), 21, 0];
            }
        }

        if (
            now.getDate() == checkDate.getDate() &&
            now.getMonth() == checkDate.getMonth()
        ) {
            checkDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
        } else {
            checkDate.setHours(7, 30, 0, 0);
        }
        generateTimeRanges(selectTime, checkDate);

        for (let i = 0; i < selectTime.options.length; i++) {
            if (selectTime.options[i].value == checkTime) {
                selectTime.value = checkTime;
            }
        }

        searchSlots(date, time, lab, name, isTech);
    });

    selectTime.addEventListener("change", function () {
        let now = new Date();
        let date = selectDate.value;
        let lab = selectLab.value;
        let name = {
            name: curName.value,
        };
        let time = [];
        let isTech = curIsTech.value === "true";
        let checkTime = selectTime.value;
        let checkDate = new Date(date);
        if (!(checkTime === "no")) {
            time = selectTime.value.split(":");
        } else {
            if (
                now.getDate() != checkDate.getDate() ||
                now.getMonth() != checkDate.getMonth()
            ) {
                time = [7, 30, 21, 0];
            } else {
                let start = selectTime.options[1].value.split(":");
                time = [start[0], start[1], 21, 0];
            }
        }

        searchSlots(date, time, lab, name, isTech);
    });

    selectLab.addEventListener("change", function () {
        let now = new Date();
        let date = selectDate.value;
        let lab = selectLab.value;
        let name = {
            name: curName.value,
        };
        let time = [];
        let isTech = curIsTech.value === "true";
        let checkTime = selectTime.value;
        let checkDate = new Date(date);
        if (!(checkTime === "no")) {
            time = selectTime.value.split(":");
        } else {
            if (
                now.getDate() != checkDate.getDate() ||
                now.getMonth() != checkDate.getMonth()
            ) {
                time = [7, 30, 21, 0];
            } else {
                let start = selectTime.options[1].value.split(":");
                time = [start[0], start[1], 21, 0];
            }
        }

        searchSlots(date, time, lab, name, isTech);
    });
    const popoverTriggerList = document.querySelectorAll(
        '[data-bs-toggle="popover"]'
    );
    const popoverList = [...popoverTriggerList].map(
        (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
    );
});
