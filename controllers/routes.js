const bcrypt = require("bcrypt");
const saltRounds = 10;

function add(server) {
    const accountModel = require("../models/accountModel");
    const faqModel = require("../models/faqModel");
    const labModel = require("../models/labModel");
    const reservationModel = require("../models/reservationModel");

    function convertToName(name) {
        let fullname = name.split("_");
        for (let i = 0; i < fullname.length; i++) {
            fullname[i] = fullname[i].charAt(0).toUpperCase() + fullname[i].slice(1);
        }
        return fullname.join(" ");
    }

    function convertToUsername(name) {
        let user = name.split(" ");
        for (let i = 0; i < user.length; i++) {
            user[i] = user[i].charAt(0).toLowerCase() + user[i].slice(1);
        }
        return user.join("_");
    }

    async function findUsers(name, cur_name) {
        let user = new Array();
        let account = await accountModel.find();
        for (const item of account) {
            if (item.name != cur_name && !item.isTech) {
                let temp = convertToName(item.name).toLowerCase();
                if (name.includes(" ")) {
                    if (name.length <= temp.length) {
                        let i = 0;
                        while (i < name.length) {
                            if (temp[i] !== name[i]) {
                                break;
                            } else {
                                i++;
                            }
                        }
                        if (i == name.length) {
                            user.push({
                                name: item.name,
                                fullname: convertToName(item.name),
                                description: item.description,
                                profile: item.profile,
                            });
                        }
                    }
                } else {
                    let names = temp.split(" ");
                    let firstname = names[0];
                    let lastname = names[1];
                    let i = 0;
                    if (name.length <= firstname.length) {
                        while (i < name.length) {
                            if (firstname[i] !== name[i]) {
                                break;
                            } else {
                                i++;
                            }
                        }
                    }
                    if (i == name.length) {
                        user.push({
                            name: item.name,
                            fullname: convertToName(item.name),
                            description: item.description,
                            profile: item.profile,
                        });
                    } else if (name.length <= lastname.length) {
                        let i = 0;
                        while (i < name.length) {
                            if (lastname[i] !== name[i]) {
                                break;
                            } else {
                                i++;
                            }
                        }
                        if (i == name.length) {
                            user.push({
                                name: item.name,
                                fullname: convertToName(item.name),
                                description: item.description,
                                profile: item.profile,
                            });
                        }
                    }
                }
            }
        }
        user.sort((a, b) => {
            const aName = a.fullname.split(' ');
            const bName = b.fullname.split(' ');
            if (aName[1] === bName[1]) {
                return (aName[0] > bName[0]) ? 1 : -1;
            } else {
                return (aName[1] > bName[1]) ? 1 : -1;
            }
        })
        return user;
    }

    server.get("/", function (req, resp) {
        let now = new Date();
        reservationModel
            .deleteMany({ datetime: { $lt: now } })
            .then(function (reservation) {
                console.log(`${reservation.deletedCount} documents deleted`);
            });

        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        } else {
            resp.redirect("/home");
        }
    });

    server.get("/login", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.render("login", {
                layout: "account",
                title: "Login",
                error: req.query.account == "failed",
            });
        } else {
            resp.redirect("/home");
        }
    });

    server.post("/login-validation", function (req, resp) {
        accountModel
            .findOne({ name: req.body.email })
            .lean()
            .then(function (account) {
                if (account != undefined && account._id != null) {
                    bcrypt.compare(
                        req.body.password,
                        account.pass,
                        function (err, result) {
                            if (result) {
                                req.session.account_id = req.sessionID;
                                req.session.account_name = account.name;
                                req.session.account_isTech = account.isTech;
                                if (req.body.remember) {
                                    req.session.cookie.maxAge = 21 * 24 * 60 * 60 * 1000;
                                } else {
                                    req.session.cookie.expires = false;
                                }
                                resp.redirect("/home");
                                return;
                            } else {
                                resp.redirect("/login?account=failed");
                                return;
                            }
                        }
                    );
                } else {
                    resp.redirect("/login?account=failed");
                    return;
                }
            });
    });

    server.get("/register", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.render("register", {
                layout: "account",
                title: "Register",
                error: req.query.account == "failed",
                registered: req.query.account == "registered",
            });
        } else {
            resp.redirect("/home");
        }
    });

    server.post("/register-validation", function (req, resp) {
        const emailFormat = /^[a-zA-Z]+[._][a-zA-Z]+$/;
        if (emailFormat.test(req.body.email)) {
            accountModel.findOne({ name: req.body.email }).then(function (account) {
                if (account) {
                    resp.redirect("/register?account=registered");
                } else {
                    const isTech = req.body.email.match(/\./g) ? true : false;
                    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                        if (req.body.url == "") {
                            req.body.url =
                                "https://upload.wikimedia.org/wikipedia/en/c/c2/De_La_Salle_University_Seal.svg";
                        }
                        const accountInstance = accountModel({
                            name: req.body.email,
                            pass: hash,
                            description: req.body.description,
                            profile: req.body.url,
                            isTech: isTech,
                        });
                        accountInstance.save();
                        resp.redirect("/login");
                        return;
                    });
                }
            });
        } else {
            resp.redirect("/register?account=failed");
        }
    });

    server.get("/logout", function (req, resp) {
        req.session.destroy(function (err) {
            resp.redirect("/login");
            return;
        });
    });

    server.get("/home", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (req.session.account_isTech) {
            resp.render("home", {
                layout: "index",
                title: "Home",
                isHome: true,
                isTech: true,
            });
        } else {
            resp.render("home", {
                layout: "index",
                title: "Home",
                isHome: true,
            });
        }
    });

    async function checkSeats(lab, slotReservations) {
        let seats = new Array();
        for (let seat = 1; seat <= lab.seats; seat++) {
            let reservedSeat = slotReservations.some((r) => r.seats.includes(seat));
            if (reservedSeat) {
                let reservation = slotReservations.find((r) => r.seats.includes(seat));
                if (!reservation.isAnonymous) {
                    let account = await accountModel.findOne({ name: reservation.name });
                    seats.push({
                        reserved: true,
                        name: account.name,
                        fullname: convertToName(account.name),
                        description: account.description,
                        profile: account.profile,
                    });
                } else {
                    seats.push({
                        reserved: true,
                        isAnonymous: true,
                    });
                }
            } else {
                seats.push({
                    reserved: false,
                });
            }
        }
        return seats;
    }

    async function checkReservedSeats(lab, slotReservations, currentUser) {
        let seats = new Array();
        for (let seat = 1; seat <= lab.seats; seat++) {
            let reservedSeat = slotReservations.some((r) => r.seats.includes(seat));
            if (reservedSeat) {
                let reservation = slotReservations.find((r) => r.seats.includes(seat));
                if (reservation.name == currentUser.name) {
                    seats.push({
                        reserved: true,
                        isUser: true,
                    });
                } else if (!reservation.isAnonymous) {
                    let account = await accountModel.findOne({ name: reservation.name });
                    seats.push({
                        reserved: true,
                        name: account.name,
                        fullname: convertToName(account.name),
                        description: account.description,
                        profile: account.profile,
                    });
                } else {
                    seats.push({
                        reserved: true,
                        isAnonymous: true,
                    });
                }
            } else {
                seats.push({
                    reserved: false,
                });
            }
        }
        return seats;
    }
    async function addSlots(start, end, room, currentUser) {
        let lab = await labModel.findOne({ name: room });
        let slots = new Array();
        let reservation = await reservationModel.find({
            lab: lab.name,
            datetime: { $gte: start, $lt: end },
        });
        let h = start.getHours();
        let m = start.getMinutes();

        while (
            h < end.getHours() ||
            (h == end.getHours() && m < end.getMinutes())
        ) {
            let slotStart = new Date(start);
            slotStart.setHours(h, m);
            let slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + 30);
            let hours_in = slotStart.getHours() % 12 || 12;
            let hours_out = slotEnd.getHours() % 12 || 12;
            let period = slotEnd.getHours() >= 12 ? "PM" : "AM";
            let time_in =
                hours_in +
                ":" +
                (slotStart.getMinutes() < 10 ? "0" : "") +
                slotStart.getMinutes() +
                " ";
            let time_out =
                hours_out +
                ":" +
                (slotEnd.getMinutes() < 10 ? "0" : "") +
                slotEnd.getMinutes() +
                " " +
                period;
            let slotReservations = reservation.filter(
                (reservation) =>
                    reservation.datetime.getHours() === slotStart.getHours() &&
                    reservation.datetime.getMinutes() === slotStart.getMinutes()
            );
            let currentUserHasReservation = slotReservations.some(
                (r) => r.name == currentUser.name
            );
            let avail_seats =
                lab.seats -
                slotReservations.reduce((total, r) => total + r.seats.length, 0);
            if (!currentUserHasReservation) {
                let date = start.toLocaleDateString("en", {
                    year: "2-digit",
                    month: "numeric",
                    day: "numeric",
                });
                let seats = await checkSeats(lab, slotReservations);
                let available = true;
                if (avail_seats === 0) {
                    available = false;
                }
                slots.push({
                    date: date,
                    lab: lab.name,
                    time_in: time_in,
                    time_out: time_out,
                    avail_seats: avail_seats,
                    seats: seats,
                    available: available,
                });
            }

            if (m >= 30) {
                h++;
                m = 0;
            } else {
                m = 30;
            }
        }
        let reservedSlots = new Array();
        let now = new Date();
        let userReservations = await reservationModel
            .find({
                name: currentUser.name
            })
            .sort({ datetime: 1 });
        for (const item of userReservations) {
            let datetime = new Date(item.datetime);
            let datetime_requested = new Date(item.datetime_requested);

            let dateOptions = { year: "numeric", month: "long", day: "numeric" };
            let timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };

            let date = datetime.toLocaleDateString("en", dateOptions);
            let date_requested = datetime_requested.toLocaleDateString(
                "en",
                dateOptions
            );

            let time = new Date(datetime.getTime());
            time.setMinutes(datetime.getMinutes() + 30);
            let timeString =
                datetime.toLocaleTimeString("en", timeOptions) +
                " - " +
                time.toLocaleTimeString("en", timeOptions);

            let time_requested = datetime_requested.toLocaleTimeString(
                "en",
                timeOptions
            );
            let reservations = await reservationModel.find();
            let slotReservations = reservations.filter(
                (reservation) => reservation.datetime.getTime() == datetime.getTime()
            );
            let lab = await labModel.findOne({ name: item.lab });
            let avail_seats =
                lab.seats -
                slotReservations.reduce((total, r) => total + r.seats.length, 0);
            let seats = await checkReservedSeats(lab, slotReservations, currentUser);
            reservedSlots.push({
                date: date,
                lab: item.lab,
                time: timeString,
                date_requested: date_requested,
                time_requested: time_requested,
                avail_seats: avail_seats,
                seats: seats,
            });
        }

        return {
            slots: slots,
            reservedSlots: reservedSlots,
        };
    }

    server.get("/reservation", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (req.session.account_isTech) {
            resp.redirect("/add-reservation");
            return;
        }

        let now = new Date();
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
        let end = new Date(start);
        end.setHours(21, 0, 0, 0);

        let name = {
            name: req.session.account_name,
        };
        async function showLabs() {
            const room = await labModel.findOne();
            const labs = await addSlots(start, end, room.name, name);
            const lab = await labModel.find().lean();
            resp.render("reservation", {
                layout: "index",
                title: "Reservation",
                isReservation: true,
                lab: lab,
                slots: labs.slots,
                reservedSlots: labs.reservedSlots,
                name: req.session.account_name,
            });
        }
        showLabs();
    });

    server.post("/fetch-slots", function (req, resp) {
        let start = new Date(req.body.date);
        start.setHours(req.body.hour_in, req.body.minute_in, 0, 0);
        let end = new Date(start);
        end.setHours(req.body.hour_out, req.body.minute_out, 59, 999);
        async function getLabs() {
            const labs = await addSlots(start, end, req.body.lab, req.body.name);
            slots = labs.slots;
            isReserved = false;
            if (slots.length == 0) {
                isReserved = true;
            }
            resp.json({
                slots: slots,
                isReserved: isReserved,
                name: req.body.name.name,
            });
        }
        getLabs();
    });

    server.post("/:name/fetch-slots", function (req, resp) {
        let start = new Date(req.body.date);
        start.setHours(req.body.hour_in, req.body.minute_in, 0, 0);
        let end = new Date(start);
        end.setHours(req.body.hour_out, req.body.minute_out, 59, 999);
        async function getLabs() {
            const labs = await addSlots(start, end, req.body.lab, req.body.name);
            slots = labs.slots;
            isReserved = false;
            if (slots.length == 0) {
                isReserved = true;
            }
            resp.json({
                slots: slots,
                isReserved: isReserved,
                name: req.body.name.name,
            });
        }
        getLabs();
    });

    server.get("/faq", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        faqModel
            .find()
            .lean()
            .then(function (faq) {
                if (req.session.account_isTech) {
                    resp.render("faq", {
                        layout: "index",
                        title: "Frequently Asked Questions",
                        isFAQ: true,
                        isTech: true,
                        faq: faq,
                    });
                } else {
                    resp.render("faq", {
                        layout: "index",
                        title: "Frequently Asked Questions",
                        isFAQ: true,
                        faq: faq,
                    });
                }
            });
    });

    server.get("/search", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (req.session.account_isTech) {
            resp.redirect("/edit-reservation");
            return;
        }
        if (req.query.search) {
            findUsers(req.query.search, req.session.account_name).then(function (
                user
            ) {
                resp.render("search", {
                    layout: "index",
                    title: "Search",
                    user: user,
                    search: req.query.search,
                });
            });
        } else {
            accountModel.find().then(function (account) {
                let user = new Array();
                for (const item of account) {
                    if (item.name != req.session.account_name && !item.isTech) {
                        user.push({
                            name: item.name,
                            fullname: convertToName(item.name),
                            description: item.description,
                            profile: item.profile,
                        });
                    }
                }
                user.sort((a, b) => {
                    const aName = a.fullname.split(' ');
                    const bName = b.fullname.split(' ');
                    if (aName[1] === bName[1]) {
                        return (aName[0] > bName[0]) ? 1 : -1;
                    } else {
                        return (aName[1] > bName[1]) ? 1 : -1;
                    }
                })
                resp.render("search", {
                    layout: "index",
                    title: "Search",
                    user: user,
                });
            });
        }
    });

    server.get("/profile", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (req.session.account_isTech) {
            resp.redirect("/home");
            return;
        }
        accountModel
            .findOne({ name: req.session.account_name })
            .then(function (account) {
                reservationModel
                    .find({ name: req.session.account_name })
                    .sort({ datetime: 1 })
                    .then(function (reservation) {
                        const user = {
                            fullname: convertToName(account.name),
                            description: account.description,
                            profile: account.profile,
                        };
                        let reservations = new Array();
                        for (const item of reservation) {
                            let datetime = new Date(item.datetime);
                            let datetime_requested = new Date(item.datetime_requested);

                            let dateOptions = {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            };
                            let timeOptions = {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            };

                            let date = datetime.toLocaleDateString("en", dateOptions);
                            let date_requested = datetime_requested.toLocaleDateString(
                                "en",
                                dateOptions
                            );

                            let time_end = new Date(datetime.getTime());
                            time_end.setMinutes(datetime.getMinutes() + 30);
                            let time =
                                datetime.toLocaleTimeString("en", timeOptions) +
                                " - " +
                                time_end.toLocaleTimeString("en", timeOptions);

                            let time_requested = datetime_requested.toLocaleTimeString(
                                "en",
                                timeOptions
                            );

                            let seat = item.seats.map(
                                (seat) => "S" + String(seat).padStart(2, "0")
                            );
                            let seats = seat.join(", ");
                            reservations.push({
                                lab: item.lab,
                                date: date,
                                time: time,
                                date_requested: date_requested,
                                time_requested: time_requested,
                                seats: seats,
                            });
                        }
                        resp.render("profile", {
                            layout: "index",
                            title: "View Profile",
                            isProfile: true,
                            user: user,
                            reservation: reservations,
                            edit: true,
                        });
                    });
            });
    });

    server.get("/profile/:name", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        accountModel.findOne({ name: req.params.name }).then(function (account) {
            reservationModel
                .find({ name: req.params.name })
                .then(function (reservation) {
                    const user = {
                        fullname: convertToName(account.name),
                        description: account.description,
                        profile: account.profile,
                    };
                    let reservations = new Array();
                    for (const item of reservation) {
                        if (!item.isAnonymous) {
                            let datetime = new Date(item.datetime);
                            let datetime_requested = new Date(item.datetime_requested);

                            let dateOptions = {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            };
                            let timeOptions = {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            };

                            let date = datetime.toLocaleDateString("en", dateOptions);
                            let date_requested = datetime_requested.toLocaleDateString(
                                "en",
                                dateOptions
                            );

                            let time_end = new Date(datetime.getTime());
                            time_end.setMinutes(datetime.getMinutes() + 30);
                            let time =
                                datetime.toLocaleTimeString("en", timeOptions) +
                                " - " +
                                time_end.toLocaleTimeString("en", timeOptions);

                            let time_requested = datetime_requested.toLocaleTimeString(
                                "en",
                                timeOptions
                            );

                            let seat = item.seats.map(
                                (seat) => "S" + String(seat).padStart(2, "0")
                            );
                            let seats = seat.join(", ");
                            reservations.push({
                                lab: item.lab,
                                date: date,
                                time: time,
                                date_requested: date_requested,
                                time_requested: time_requested,
                                seats: seats,
                            });
                        }
                    }
                    resp.render("profile", {
                        layout: "index",
                        title: user.name,
                        user: user,
                        reservation: reservations,
                        edit: false,
                    });
                });
        });
    });

    server.post("/edit-profile", function (req, resp) {
        accountModel
            .findOne({ name: req.session.account_name })
            .then(function (account) {
                if (req.body.url || req.body.url.trim() !== "") {
                    account.profile = req.body.url;
                }
                account.description = req.body.desc;
                account.save().then(function (result) {
                    resp.redirect("/profile");
                });
            });
    });

    server.post("/delete-account", function (req, resp) {
        reservationModel
            .deleteMany({ name: req.session.account_name })
            .then(function (reservation) {
                console.log(`${reservation.deletedCount} documents deleted`);
                accountModel
                    .findOneAndDelete({ name: req.session.account_name })
                    .then(function (account) {
                        console.log(
                            `${convertToName(account.name)}'s account has been deleted`
                        );
                        req.session.destroy(function (err) {
                            resp.redirect("/login");
                            return;
                        });
                    });
            });
    });

    server.get("/add-reservation", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (!req.session.account_isTech) {
            resp.redirect("/reservation");
            return;
        }
        if (req.query.search) {
            findUsers(req.query.search, req.session.account_name).then(function (
                user
            ) {
                resp.render("reservation-tech", {
                    layout: "index",
                    title: "Add Reservation",
                    isReservation: true,
                    isAdd: true,
                    user: user,
                    search: req.query.search,
                });
            });
        } else {
            accountModel.find().then(function (account) {
                let user = new Array();
                for (const item of account) {
                    if (!item.isTech) {
                        user.push({
                            name: item.name,
                            fullname: convertToName(item.name),
                            description: item.description,
                            profile: item.profile,
                        });
                    }
                }
                user.sort((a, b) => {
                    const aName = a.fullname.split(' ');
                    const bName = b.fullname.split(' ');
                    if (aName[1] === bName[1]) {
                        return (aName[0] > bName[0]) ? 1 : -1;
                    } else {
                        return (aName[1] > bName[1]) ? 1 : -1;
                    }
                })
                resp.render("reservation-tech", {
                    layout: "index",
                    title: "Add Reservation",
                    isReservation: true,
                    isAdd: true,
                    user: user,
                });
            });
        }
    });

    server.get("/add-reservation/:name", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (!req.session.account_isTech) {
            resp.redirect("/reservation");
            return;
        }
        let now = new Date();
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

        let end = new Date(start);
        end.setHours(21, 0, 0, 0);

        async function showLabs() {
            const account = await accountModel.findOne({ name: req.params.name });
            const room = await labModel.findOne();
            const labs = await addSlots(start, end, room.name, account);
            const lab = await labModel.find().lean();
            resp.render("reservation", {
                layout: "index",
                title: "Add Reservation",
                isReservation: true,
                lab: lab,
                slots: labs.slots,
                isTech: true,
                name: account.name,
                fullname: convertToName(account.name),
            });
        }
        showLabs();
    });

    server.get("/edit-reservation", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (!req.session.account_isTech) {
            resp.redirect("/reservation");
            return;
        }
        if (req.query.search) {
            findUsers(req.query.search, req.session.account_name).then(function (
                user
            ) {
                resp.render("reservation-tech", {
                    layout: "index",
                    title: "Edit Reservation",
                    isReservation: true,
                    user: user,
                    search: req.query.search,
                });
            });
        } else {
            accountModel.find().then(function (account) {
                let user = new Array();
                for (const item of account) {
                    if (!item.isTech) {
                        user.push({
                            name: item.name,
                            fullname: convertToName(item.name),
                            description: item.description,
                            profile: item.profile,
                        });
                    }
                }
                user.sort((a, b) => {
                    const aName = a.fullname.split(' ');
                    const bName = b.fullname.split(' ');
                    if (aName[1] === bName[1]) {
                        return (aName[0] > bName[0]) ? 1 : -1;
                    } else {
                        return (aName[1] > bName[1]) ? 1 : -1;
                    }
                })
                resp.render("reservation-tech", {
                    layout: "index",
                    title: "Edit Reservation",
                    isReservation: true,
                    user: user,
                });
            });
        }
    });

    server.get("/edit-reservation/:name", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (!req.session.account_isTech) {
            resp.redirect("/reservation");
            return;
        }
        async function showLabs() {
            const account = await accountModel.findOne({ name: req.params.name });
            const lab = await labModel.findOne();
            const start = new Date();
            const end = new Date();
            const labs = await addSlots(start, end, lab.name, account);
            resp.render("reservation", {
                layout: "index",
                title: "Edit Reservation",
                isReservation: true,
                reservedSlots: labs.reservedSlots,
                isTech: true,
                name: account.name,
                fullname: convertToName(account.name),
            });
        }
        showLabs();
    });

    server.post("/add-faq", function (req, resp) {
        faqModel
            .find()
            .lean()
            .then(function (faq) {
                const faqInstance = faqModel({
                    question: req.body.question,
                    answer: req.body.answer,
                });

                faqInstance.save().then(function (result) {
                    resp.redirect("/faq");
                });
            });
    });

    server.post("/edit-faq", function (req, resp) {
        faqModel.findOne({ _id: req.body.id }).then(function (faq) {
            faq.question = req.body.question;
            faq.answer = req.body.answer;
            faq.save().then(function (result) {
                resp.redirect("/faq");
            });
        });
    });

    server.post("/delete-faq", function (req, resp) {
        faqModel.findOneAndDelete({ _id: req.body.id }).then(function (faq) {
            console.log(`faq#${faq._id} has been deleted`);
            resp.redirect("/faq");
        });
    });

    server.get("/confirm-reservation", function (req, resp) {
        let lab = req.query.lab;
        let date = req.query.date;
        let time = req.query.time;
        let seats = req.query.seats;
        let anon = req.query.anon;
        let user = req.session.account_name;

        console.log(user);
        console.log(date);
        console.log(lab);

        let datetime = new Date();
        if (date.includes("/")) {
            const dateParts = date.split("/");
            const timeParts = time.split(" ");
            const specTime = timeParts[0].split(":");
            let numTime = specTime.map(str => parseInt(str));
            if (String(timeParts[3]) == "PM") {
                numTime[0] += 12;
            }
            datetime.setFullYear(
                Number(dateParts[2]) + 2000,
                dateParts[0] - 1,
                dateParts[1]
            );
            datetime.setHours(numTime[0], numTime[1], 0, 0);
        } else {
            const numDate = new Date(date);
            const month = numDate.getMonth();
            const day = numDate.getDate();
            const year = numDate.getFullYear();
            const timeParts = time.split(" ");
            const specTime = timeParts[0].split(":");
            let numTime = specTime.map(str => parseInt(str));
            if (String(timeParts[1]) == "PM") {
                numTime[0] += 12;
            }
            datetime.setFullYear(year, month, day);
            datetime.setHours(numTime[0], numTime[1], 0, 0);
        }

        console.log(datetime);

        const currentDate = new Date();
        const datetime_requested = currentDate.toISOString();

        console.log(datetime_requested);

        console.log(req.session.account_name);

        const seatsArray = seats
            .split(",")
            .map((seat) => parseInt(seat.trim().replace(/\D/g, ""), 10));

        console.log(seatsArray);

        let isAnonymous = false;
        if (anon === "Yes") {
            isAnonymous = true;
        }
        console.log(isAnonymous);

        const searchQuery = {
            lab: lab,
            datetime: datetime,
            name: req.session.account_name,
        };
        reservationModel.findOne(searchQuery).then(function (reservation) {
            if (reservation) {
                reservation.datetime_requested = datetime_requested;
                reservation.seats = seatsArray;
                reservation.isAnonymous = isAnonymous;
                reservation.save().then(function () {
                    resp.redirect("/reservation");
                });
            } else {
                const reservationInstance = reservationModel({
                    lab: lab,
                    datetime: datetime,
                    datetime_requested: datetime_requested,
                    name: req.session.account_name,
                    seats: seatsArray,
                    isAnonymous: isAnonymous,
                });
                reservationInstance.save().then(function () {
                    resp.redirect("/reservation");
                });
            }
        });
    });

    server.get("/confirm-reservation-tech", function (req, resp) {
        let lab = req.query.lab;
        let date = req.query.date;
        let time = req.query.time;
        let seats = req.query.seats;
        let anon = req.query.anon;
        let name = convertToUsername(req.query.name);
        let mode;

        console.log(name);
        console.log(req.session.account_name);
        console.log(lab);

        let datetime = new Date();
        if (date.includes("/")) {
            const dateParts = date.split("/");
            const timeParts = time.split(" ");
            const specTime = timeParts[0].split(":");
            let numTime = specTime.map(str => parseInt(str));
            if (String(timeParts[3]) == "PM") {
                numTime[0] += 12;
            }
            datetime.setFullYear(
                Number(dateParts[2]) + 2000,
                dateParts[0] - 1,
                dateParts[1]
            );
            datetime.setHours(numTime[0], numTime[1], 0, 0);
            mode = "add";
        } else {
            const numDate = new Date(date);
            const month = numDate.getMonth(); // Adding 1 because months are zero-indexed
            const day = numDate.getDate();
            const year = numDate.getFullYear();
            const timeParts = time.split(" ");
            const specTime = timeParts[0].split(":");
            let numTime = specTime.map(str => parseInt(str));
            if (String(timeParts[1]) == "PM") {
                numTime[0] += 12;
            }
            datetime.setFullYear(year, month, day);
            datetime.setHours(numTime[0], numTime[1], 0, 0);
            mode = "edit"
        }

        console.log(datetime);

        const currentDate = new Date();
        const datetime_requested = currentDate.toISOString();

        console.log(datetime_requested);

        const seatsArray = seats
            .split(",")
            .map((seat) => parseInt(seat.trim().replace(/\D/g, ""), 10));

        console.log(seatsArray);

        let isAnonymous = false;
        if (anon === "Yes") {
            isAnonymous = true;
        }
        console.log(isAnonymous);

        const searchQuery = {
            lab: lab,
            datetime: datetime,
            name: name,
        };
        reservationModel.findOne(searchQuery).then(function (reservation) {
            if (reservation) {
                reservation.datetime_requested = datetime_requested;
                reservation.seats = seatsArray;
                reservation.isAnonymous = isAnonymous;
                reservation.save().then(function () {
                    if (mode == "add") {
                        resp.redirect("./add-reservation/" + name);
                    } else {
                        resp.redirect("./edit-reservation/" + name);
                    }
                });
            } else {
                const reservationInstance = reservationModel({
                    lab: lab,
                    datetime: datetime,
                    datetime_requested: datetime_requested,
                    name: name,
                    seats: seatsArray,
                    isAnonymous: isAnonymous,
                });
                reservationInstance.save().then(function () {
                    if (mode == "add") {
                        resp.redirect("./add-reservation/" + name);
                    } else {
                        resp.redirect(".edit-reservation/" + name);
                    }
                });
            }
        });
    });

    server.get("/delete-reservation", function (req, resp) {
        let lab = req.query.lab;
        let date = req.query.date;
        let time = req.query.time;
        let user = req.session.account_name;

        console.log(user);
        console.log(lab);

        let datetime = new Date();
        const numDate = new Date(date);
        const month = numDate.getMonth(); // Adding 1 because months are zero-indexed
        const day = numDate.getDate();
        const year = numDate.getFullYear();
        const timeParts = time.split(" ");
        const specTime = timeParts[0].split(":");
        let numTime = specTime.map(str => parseInt(str));
        if (String(timeParts[1]) == "PM") {
            numTime[0] += 12;
        }
        datetime.setFullYear(year, month, day);
        datetime.setHours(numTime[0], numTime[1], 0, 0);


        console.log(datetime);

        reservationModel
            .deleteMany({ name: user, lab: lab, datetime: datetime })
            .then(function (reservation) {
                console.log(`${reservation.deletedCount} documents deleted`);
            });

        resp.redirect("/reservation");
    });

    server.get("/delete-reservation-tech", function (req, resp) {
        let lab = req.query.lab;
        let date = req.query.date;
        let time = req.query.time;
        let user = req.session.account_name;
        let name = convertToUsername(req.query.name);

        console.log(user);
        console.log(name);
        console.log(lab);

        let datetime = new Date();
        const numDate = new Date(date);
        const month = numDate.getMonth(); // Adding 1 because months are zero-indexed
        const day = numDate.getDate();
        const year = numDate.getFullYear();
        const timeParts = time.split(" ");
        const specTime = timeParts[0].split(":");
        let numTime = specTime.map(str => parseInt(str));
        if (String(timeParts[1]) == "PM") {
            numTime[0] += 12;
        }
        datetime.setFullYear(year, month, day);
        datetime.setHours(numTime[0], numTime[1], 0, 0);

        console.log(datetime);

        reservationModel
            .deleteMany({ name: name, lab: lab, datetime: datetime })
            .then(function (reservation) {
                console.log(`${reservation.deletedCount} documents deleted`);
            });

        resp.redirect("./edit-reservation/" + name);
    });

    server.get("/about", function (req, resp) {
        if (req.session.account_id == undefined) {
            resp.redirect("/login");
            return;
        }
        if (req.session.account_isTech) {
            resp.render("about", {
                layout: "index",
                title: "About Us",
                isAbout: true,
                isTech: true,
            });
        } else {
            resp.render("about", {
                layout: "index",
                title: "About Us",
                isAbout: true,
            });
        }
    });
}

module.exports.add = add;
