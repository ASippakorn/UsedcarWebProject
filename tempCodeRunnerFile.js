router.put('/edit/:id', (req, res) => {
//     const { cartype, brand, model, mileage, year, description, fuel, insurance, price } = req.body;

//     const sql = "UPDATE Car SET cartype=?, brand=?, model=?, mileage=?, year=?, description=?, fuel=?, insurance=?, price=? WHERE carid=?";
//     dbcon.query(sql, [cartype, brand, model, mileage, year, description, fuel, insurance, price, req.params.id], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Server error');
//         }
//         if (result.affectedRows === 0) { // Corrected this line
//             return res.status(404).send({ error: "Record not found" });
//         }
//         res.send({ message: "Record edited successfully" });
//     });
// });
