const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(express.json())
app.use(cors())
const fs = require("fs");

const productionDB = "./productionDB.json";

// create file if not exists
if (!fs.existsSync(productionDB)) {
    fs.writeFileSync(productionDB, JSON.stringify({}));
}

function readProduction() {
    return JSON.parse(fs.readFileSync(productionDB));
}

function writeProduction(data) {
    fs.writeFileSync(productionDB, JSON.stringify(data, null, 2));
}
const ordersDB = "./ordersDB.json";

if (!fs.existsSync(ordersDB)) {
    fs.writeFileSync(ordersDB, JSON.stringify({}));
}

function readOrders() {
    return JSON.parse(fs.readFileSync(ordersDB));
}

function writeOrders(data) {
    fs.writeFileSync(ordersDB, JSON.stringify(data, null, 2));
}
/* CONNECT DATABASE */

/* CONNECT DATABASES */

const pharmaDB = mongoose.createConnection("mongodb://127.0.0.1:27017/pharmaDB");
const biotechDB = mongoose.createConnection("mongodb://127.0.0.1:27017/biotechDB");

pharmaDB.on("connected", () => {
    console.log("Pharma Database Connected");
});

biotechDB.on("connected", () => {
    console.log("Biotech Database Connected");
});
/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ================= MONGODB CONNECTION ================= */

mongoose.connect("mongodb://127.0.0.1:27017/mainDB")
    .then(() => {
        console.log("Main MongoDB Connected");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error:", err);
    });
/* ================= USER SCHEMA ================= */

const User = mongoose.model("User", {
    firstName: String,
    lastName: String,
    dob: String,
    branchCode: String,
    branchAddress: String,
    email: String,
    password: String
});

/* ================= DEFAULT PAGE ================= */
/* When opening http://localhost:5000 */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

/* ================= PRODUCTS API ================= */

app.get("/api/products", (req, res) => {

    res.json({

        products: [
            { name: "Sucralsain", cost: 850 },
            { name: "Dolo-650", cost: 700 },
            { name: "Paracetamol", cost: 800 },
            { name: "Multivitamin", cost: 470 },
            { name: "Becovit-z syrup", cost: 1200 },
            { name: "Metformin", cost: 920 },
            { name: "Cetirizine", cost: 1150 },
            { name: "Ciprofloxacin", cost: 550 },
            { name: "Aspirin", cost: 670 },
            { name: "Pantoprazole", cost: 380 },
            { name: "Azithromycin", cost: 850 },
            { name: "Mephtol", cost: 600 },
            { name: "Netcold", cost: 550 },
            { name: "Swich 100", cost: 600 },
            { name: "Levocetirizine 5mg", cost: 1300 }
        ],

        bestsellers: [
            { name: "Dolo-650", cost: 700 },
            { name: "Paracetamol", cost: 800 },
            { name: "Azithromycin", cost: 850 },
            { name: "Metformin", cost: 920 },
            { name: "Multivitamin", cost: 470 }
        ]

    });

});

/* ================= REGISTER USER ================= */

app.post("/register", async (req, res) => {

    console.log("Registration Data:", req.body);

    try {

        /* CHECK DUPLICATE USER */

        const existingUser = await User.findOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: req.body.dob
        });

        if (existingUser) {

            return res.json({
                message: "User already registered"
            });

        }

        /* SAVE NEW USER */

        const user = new User(req.body);

        await user.save();

        res.json({
            message: "Registration Successful"
        });

    }

    catch (error) {

        console.log("Registration Error:", error);

        res.status(500).json({
            message: "Registration Failed"
        });

    }

});

/* ================= LOGIN USER ================= */

app.post("/login", async (req, res) => {

    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password
    });

    if (user) {

        res.json({
            message: "Login Successful"
        });

    } else {

        res.json({
            message: "Invalid Login"
        });

    }

});

/* ================= GET ALL USERS ================= */

app.get("/users", async (req, res) => {

    const users = await User.find();

    res.json(users);

});

/* ================= START SERVER ================= */

app.listen(5000, () => {

    console.log("Server running at http://localhost:5000");

});
const orderSchema = new mongoose.Schema({

    agency: String,
    product: String,
    quantity: Number,
    totalBill: Number,
    week: Number,
    month: Number,
    year: Number

})

const Order = pharmaDB.model("Order", orderSchema)
const BiotechOrder = biotechDB.model("Order", orderSchema)
const productionSchema = new mongoose.Schema({

    medicine: String,
    type: String,
    production: Number,
    limit: Number,
    date: Date

})
app.get("/api/production", async (req, res) => {

    let date = req.query.date;
    if (!date) return res.json([]);

    let today = new Date();
    let selected = new Date(date);

    // FUTURE MONTHS → no auto production
    if (
        selected.getFullYear() > today.getFullYear() ||
        (selected.getFullYear() === today.getFullYear() &&
            selected.getMonth() > today.getMonth())
    ) {
        return res.json([]);
    }

    // FUTURE DAYS IN CURRENT MONTH → manual only
    try {

        let start = new Date(date);
        let end = new Date(date);
        end.setDate(end.getDate() + 1);

        let existing = await Production.find({
            date: {
                $gte: start,
                $lt: end
            }
        });

        if (existing.length > 0) {
            return res.json(existing);
        }

        // FUTURE DATE → no automatic production
        if (selected > today) {
            return res.json([]);
        }

        // AUTO GENERATE FOR PAST AND CURRENT DATE
        let results = [];

        for (let i = 0; i < 4; i++) {

            let med = medicines[Math.floor(Math.random() * medicines.length)];

            let production = Math.floor(Math.random() * med.limit) + 100;

            let record = new Production({
                medicine: med.name,
                type: med.type,
                production: production,
                limit: med.limit,
                date: date
            });

            await record.save();
            results.push(record);
        }

        res.json(results);

    } catch (err) {

        console.log(err);
        res.json([]);

    }

});
/* ================= BIOTECH PRODUCTS ================= */

app.get("/api/biotech-products", (req, res) => {

    res.json({

        products: [
            { name: "COVAXIN® (COVID-19)", cost: 900 },
            { name: "iNCOVACC® (Intranasal COVID-19)", cost: 850 },
            { name: "Typbar TCV® (Typhoid)", cost: 700 },
            { name: "ROTAVAC® / ROTAVAC 5D®", cost: 750 },
            { name: "JENVAC® (Japanese Encephalitis)", cost: 880 },
            { name: "Chirorab® / Indirab® (Rabies)", cost: 820 },
            { name: "Hillchol® (Cholera)", cost: 760 },
            { name: "Biopolio® (Polio)", cost: 640 },
            { name: "Revac-B+® (Hepatitis B)", cost: 720 },
            { name: "ComvacTM (Combination Vaccine)", cost: 980 },
            { name: "HNVAC® (H1N1)", cost: 870 },
            { name: "Malcovax (Malaria)", cost: 950 }
        ],

        bestsellers: [
            { name: "COVAXIN®", cost: 900 },
            { name: "ROTAVAC®", cost: 750 },
            { name: "JENVAC®", cost: 880 },
            { name: "Biopolio®", cost: 640 },
            { name: "Revac-B+®", cost: 720 }
        ]

    });

});
const Production = pharmaDB.model("Production", productionSchema)
app.post("/api/production", async (req, res) => {

    try {

        let { medicine, production, limit, date } = req.body;

        const newProduction = new Production({
            medicine,
            production,
            limit,
            date: new Date(date)
        });

        await newProduction.save();

        res.json({ message: "Production saved successfully" });

    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Error saving production" });

    }

});
app.get("/calendar-data", (req, res) => {

    let db = readProduction();


    const selectedDate = new Date(req.query.month || today);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    const days = new Date(year, month, 0).getDate();

    let events = [];

    for (let i = 1; i <= days; i++) {

        let dateKey = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

        if (db[dateKey]) {

            events.push({
                title: `Production ${db[dateKey]}`,
                start: dateKey
            });

        } else {

            // past month auto data
            if (new Date(dateKey) < today) {

                let auto = Math.floor(Math.random() * 400) + 100;

                db[dateKey] = auto;

                events.push({
                    title: `Production ${auto}`,
                    start: dateKey
                });

            } else {

                events.push({
                    title: "No data",
                    start: dateKey
                });

            }

        }

    }

    writeProduction(db);

    res.json(events);

});


const medicines = [

    { name: "Dolo-650", type: "tablet", limit: 5000 },
    { name: "Sucralsain", type: "tablet", limit: 5000 },
    { name: "Dolo-650", type: "tablet", limit: 5000 },
    { name: "Paracetamol", type: "tablet", limit: 5000 },
    { name: "Multivitamin", type: "tablet", limit: 5000 },
    { name: "Becovit-z syrup", type: "syrup", limit: 1000 },
    { name: "Metformin", type: "tablet", limit: 5000 },
    { name: "Cetirizine", type: "tablet", limit: 5000 },
    { name: "Ciprofloxacin", type: "syrup", limit: 1000 },
    { name: "Aspirin", type: "tablet", limit: 5000 },
    { name: "Pantoprazole", type: "tablet", limit: 5000 },
    { name: "Azithromycin", type: "tablet", limit: 5000 },
    { name: "Mephtol", type: "tablet", limit: 5000 },
    { name: "Netcold", type: "syrup", limit: 1000 },
    { name: "Swich 100", type: "syrup", limit: 1000 },
    { name: "Levocetirizine 5mg", type: "tablet", limit: 5000 }
]
const biotechMedicines = [

    { name: "COVAXIN", type: "vaccine", limit: 1000 },
    { name: "iNCOVACC", type: "vaccine", limit: 1000 },
    { name: "Typbar TCV", type: "vaccine", limit: 1000 },
    { name: "ROTAVAC", type: "vaccine", limit: 1000 },
    { name: "JENVAC", type: "vaccine", limit: 1000 },
    { name: "Chirorab", type: "vaccine", limit: 1000 },
    { name: "Hillchol", type: "vaccine", limit: 1000 },
    { name: "Biopolio", type: "vaccine", limit: 1000 },
    { name: "Revac-B+", type: "vaccine", limit: 1000 },
    { name: "Comvac", type: "vaccine", limit: 1000 },
    { name: "HNVAC", type: "vaccine", limit: 1000 },
    { name: "Malcovax", type: "vaccine", limit: 1000 }


];
app.post("/api/orders", async (req, res) => {

    try {

        const order = new Order(req.body)

        await order.save()

        res.json({ message: "Order saved successfully" })

    } catch (err) {

        console.log(err)

        res.status(500).json({ message: "Error saving order" })

    }

})
app.get("/api/orders", async (req, res) => {

    try {

        let week = Number(req.query.week)
        let month = Number(req.query.month)
        let year = Number(req.query.year)

        let orders = await Order.find({
            week: week,
            month: month,
            year: year
        })

        res.json(orders)

    } catch (err) {

        console.log(err)

        res.status(500).json([])

    }

})
/* ================= BIOTECH ORDERS ================= */

// SAVE BIOTECH ORDER
app.post("/api/biotech-orders", async (req, res) => {

    try {

        const order = new BiotechOrder(req.body);

        await order.save();

        res.json({ message: "Biotech Order saved successfully" });

    } catch (err) {

        console.log(err);
        res.status(500).json({ message: "Error saving biotech order" });

    }

});

// GET BIOTECH ORDERS
app.get("/api/biotech-orders", async (req, res) => {

    try {

        let week = Number(req.query.week);
        let month = Number(req.query.month);
        let year = Number(req.query.year);

        let today = new Date();
        let selectedDate = new Date(year, month - 1, week * 7);

        let existing = await BiotechOrder.find({ week, month, year });

        // ✅ FUTURE → no data
        // ✅ FUTURE → show manual data
        if (selectedDate > today) {

            let existing = await BiotechOrder.find({ week, month, year });
            // ✅ FORCE GENERATE FOR PAST
            if (selectedDate < today) {
                await BiotechOrder.deleteMany({ week, month, year });
            }

            return res.json(existing);
        }

        // ✅ IF DATA EXISTS → RETURN
        // re-fetch after delete
        let existingData = await BiotechOrder.find({ week, month, year });

        if (existingData.length > 0) {
            return res.json(existingData);
        }


        // ✅ PAST → generate random data
        let agencies = [
            "BioGenex",
            "Lupin Diagnostics",
            "Novozymes South Asia",
            "MedGenome Labs Pvt. Ltd.",
            "PathCare Labs",
            "Sathya Diagnostic Center",
            "Sprint Diagnostics",
            "Thyrocare Diagnostic Centre",
            "Agilus Diagnostics ",
            "Eurofins Advinus",
            "Sai Life Sciences",
            "Redcliffe Labs"
        ];

        let products = [
            { name: "COVAXIN", cost: 900 },
            { name: "iNCOVACC", cost: 850 },
            { name: "Typbar TCV", cost: 700 },
            { name: "ROTAVAC", cost: 750 },
            { name: "JENVAC", cost: 880 },
            { name: "Chirorab", cost: 820 },
            { name: "Hillchol", cost: 760 },
            { name: "Biopolio", cost: 640 },
            { name: "Revac-B+", cost: 720 },
            { name: "ComvacTM", cost: 980 },
            { name: "HNVAC", cost: 870 },
            { name: "Malcovax", cost: 950 }
        ];

        let results = [];

        for (let i = 0; i < 4; i++) {

            let agency = agencies[Math.floor(Math.random() * agencies.length)];
            let productObj = products[Math.floor(Math.random() * products.length)];
            let quantity = Math.floor(Math.random() * 500) + 50;

            let record = new BiotechOrder({
                agency,
                product: productObj.name,
                quantity,
                totalBill: quantity * productObj.cost,
                week,
                month,
                year
            });

            await record.save();
            results.push(record);
        }

        res.json(results);

    } catch (err) {

        console.log(err);
        res.status(500).json([]);

    }

});
app.post("/add-order", (req, res) => {

    const { week, month, year, agency, product, quantity, totalBill } = req.body;

    let db = readOrders();

    let key = `${year}-${month}-week${week}`;

    if (!db[key]) {
        db[key] = [];
    }

    db[key].push({
        agency,
        product,
        quantity,
        totalBill
    });

    writeOrders(db);

    res.json({ message: "Order saved successfully" });

});
const complaintSchema = new mongoose.Schema({

    product: String,
    text: String,
    solution: String,
    month: Number,
    year: Number,
    closed: { type: Boolean, default: false }

})

const Complaint = pharmaDB.model("Complaint", complaintSchema)
const BiotechComplaint = biotechDB.model("Complaint", complaintSchema)
app.get("/api/complaints", async (req, res) => {

    let month = Number(req.query.month)
    let year = Number(req.query.year)

    let today = new Date()

    let data = await Complaint.find({ month, year })

    if (data.length > 0) {
        return res.json(data)
    }

    if (year < today.getFullYear() ||
        (year === today.getFullYear() && month < today.getMonth() + 1)) {

        let complaints = [
            "Packaging damage",
            "Tablet breakage",
            "Wrong batch delivered",
            "Expiry date confusion",
            "Customer reported side effects",
            "Distributor supply delay"
        ]

        let results = []

        for (let i = 0; i < 4; i++) {

            let prod = products[Math.floor(Math.random() * products.length)]
            let record = new Complaint({

                product: prod,
                text: complaints[Math.floor(Math.random() * complaints.length)],
                month,
                year

            })

            await record.save()
            results.push(record)

        }

        return res.json(results)

    }

    res.json([])

})
app.post("/api/complaints", async (req, res) => {

    const c = new Complaint(req.body)

    await c.save()

    res.json({ message: "Saved" })

})
app.post("/api/complaints/close", async (req, res) => {

    await Complaint.findByIdAndUpdate(req.body.id, {
        closed: true,
        solution: "Resolved by quality team"
    })

    res.json({ message: "Closed" })

})
app.post("/api/complaints/solution", async (req, res) => {

    let { id, solution } = req.body

    await Complaint.findByIdAndUpdate(id, {

        solution: solution

    })

    res.json({ message: "Solution added" })

})
app.get("/api/biotech-complaints", async (req, res) => {

    let month = Number(req.query.month);
    let year = Number(req.query.year);

    let today = new Date();
    let selectedDate = new Date(year, month - 1);

    // 🔥 ALWAYS FETCH EXISTING FIRST
    let existing = await BiotechComplaint.find({ month, year });

    // ✅ PRESENT MONTH → ALWAYS RETURN DB DATA
    if (
        selectedDate.getFullYear() === today.getFullYear() &&
        selectedDate.getMonth() === today.getMonth()
    ) {
        return res.json(existing);
    }

    // ✅ FUTURE → ONLY EXISTING
    if (selectedDate > today) {
        return res.json(existing);
    }

    // 🔥 PAST → GENERATE ONLY IF EMPTY
    if (existing.length > 0) {
        return res.json(existing);
    }

    // 🔥 GENERATE RANDOM (ONLY FIRST TIME)
    let complaintTypes = [
        "Vaccine Quality Issue",
        "Cold Storage Failure",
        "Packaging Damage",
        "Delivery Delay"
    ];

    let descriptions = [
        "Issue observed during testing",
        "Temperature fluctuation",
        "Transport damage",
        "Delivery delayed"
    ];
    let results = [];

    for (let i = 0; i < 4; i++) {

        let isClosed = Math.random() > 0.5;

        let record = new BiotechComplaint({
            product: complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
            text: descriptions[Math.floor(Math.random() * descriptions.length)],
            month,
            year,
            solution: isClosed ? "Resolved by biotech team" : "",
            closed: isClosed
        });

        await record.save();
        results.push(record);
    }
    res.json(results);
});
app.post("/api/biotech-complaints", async (req, res) => {

    try {

        let { product, text, month, year } = req.body;

        const newComplaint = new BiotechComplaint({
            product,
            text,
            month,
            year,
            solution: "",
            closed: false
        });

        await newComplaint.save();

        console.log("Saved Complaint:", newComplaint); // debug

        res.json({ message: "Saved successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error saving complaint" });
    }
});
app.post("/api/biotech-complaints/solution", async (req, res) => {

    let { id, solution } = req.body;

    await BiotechComplaint.findByIdAndUpdate(id, {
        solution: solution
    });

    res.json({ message: "Solution added" });
});
app.post("/api/biotech-complaints/close", async (req, res) => {

    let { id } = req.body;

    await BiotechComplaint.findByIdAndUpdate(id, {
        closed: true
    });

    res.json({ message: "Closed" });
});
//BIOTECH//
const BiotechProduction = biotechDB.model("Production", productionSchema)
app.get("/api/biotech-production", async (req, res) => {

    try {

        let date = req.query.date;
        if (!date) return res.json([]);

        let selected = new Date(date);
        let today = new Date();

        today.setHours(0, 0, 0, 0);
        selected.setHours(0, 0, 0, 0);

        let start = new Date(date);
        let end = new Date(date);
        end.setDate(end.getDate() + 1);

        let existing = await BiotechProduction.find({
            date: { $gte: start, $lt: end }
        });

        // ✅ FUTURE → no auto
        if (selected > today) {
            return res.json(existing);
        }

        // ✅ TODAY → only existing
        if (selected.getTime() === today.getTime()) {
            return res.json(existing);
        }

        // ✅ PAST → generate if empty
        if (existing.length > 0) {
            return res.json(existing);
        }

        let results = [];

        for (let i = 0; i < 4; i++) {

            let med = biotechMedicines[Math.floor(Math.random() * biotechMedicines.length)];

            let production = Math.floor(Math.random() * med.limit) + 100;

            let record = new BiotechProduction({
                medicine: med.name,
                type: med.type,
                production: production,
                limit: med.limit,
                date: new Date(date)
            });

            await record.save();
            results.push(record);
        }

        res.json(results);

    } catch (err) {
        console.log("ERROR IN BIOTECH API:", err);
        res.json([]);
    }

});
app.get("/fix-biotech-prices", async (req, res) => {

    try {

        const priceMap = {
            "COVAXIN® (COVID-19)": 900,
            "iNCOVACC® (Intranasal COVID-19)": 850,
            "Typbar TCV® (Typhoid)": 700,
            "ROTAVAC® / ROTAVAC 5D®": 750,
            "JENVAC® (Japanese Encephalitis)": 880,
            "Chirorab® / Indirab® (Rabies)": 820,
            "Hillchol® (Cholera)": 760,
            "Biopolio® (Polio)": 640,
            "Revac-B+® (Hepatitis B)": 720,
            "ComvacTM (Combination Vaccine)": 980,
            "HNVAC® (H1N1)": 870,
            "Malcovax (Malaria)": 950,
            "Hillchol": 760,
            "Malcovax": 950
        };

        let orders = await BiotechOrder.find();

        for (let order of orders) {

            let price = priceMap[order.product] || 0;

            order.totalBill = order.quantity * price;

            await order.save();
        }

        res.json({ message: "All old data updated successfully ✅" });

    } catch (err) {

        console.log(err);
        res.status(500).json({ message: "Error updating data" });

    }

});
app.post("/api/biotech-production", async (req, res) => {

    try {

        const newProduction = new BiotechProduction(req.body);

        await newProduction.save();

        res.json({ message: "Biotech Production saved successfully" });

    } catch (error) {

        console.log(error);

        res.status(500).json({ message: "Error saving production" });

    }

});
