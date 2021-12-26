const mongoose = require('mongoose');
const creatureUserModel = require('./models/creatureUserSchema');

exports.database = () => {
    mongoose
        .connect(
            process.env['DBTOKEN'],
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            }
        )
        .then(() => {
            console.log('located the juice');
            //monitor()
            
        })
        .catch(err => {
            console.log(err);
        });
}
async function monitor(timeInMs = 60000) {
    const pipeline = [
        {
            '$match': {
                'operationType': 'update',
                'updateDescription.updatedFields': 'flarins'
            }
        }
    ];
    let changeStream = creatureUserModel.watch([]);
    changeStream.on('change', (next) => {
        console.log(next);
    });
    await closeChangeStream(timeInMs, changeStream);
}
function closeChangeStream(timeInMs = 60000, changeStream) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Closing the change stream");
            changeStream.close();
            resolve();
        }, timeInMs)
    })
};