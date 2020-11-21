const {
    resolveCname
} = require("dns");
const path = require("path")
const {
    Worker,
    ismainThread
} = require("worker_threads");

const pathToResizeWorker = path.resolve(__dirname, 'resizeWorker.js');
const pathToMonochromeWorker = path.resolve(__dirname, 'monochromeWorker.js');

function uploadPathResolver(filename) {
    return path.resolve(__dirname, '../uploads', filename);
}


function imageProcessor(filename) {
    const sourcePath = uploadPathResolver(filename);
    const resizedDestination = uploadPathResolver('resized-' + filename)
    const monochromeDestination = uploadPathResolver('monochrome-' + filename)
    let resizeWorkerFinished = false
    let monochromeWorkerFinished  = false
    return new Promise((resolve, reject) => {
        if (ismainThread) {
            try {
                const resizeWorker = new Worker(pathToResizeWorker, {
                    workerData: {
                        source: sourcePath,
                        destination: resizedDestination
                    }
                })
                resizeWorker.on('message', (message) => {
                    resizeWorkerFinished = true;
                    resolve('resizeWorker finished processing')
                })
                resizeWorker.on('error', (err) => {
                    reject(new Error(err.message));
                })
                resizeWorker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error('Exited with status code ' + code))
                    }
                })

                const monochromeWorker = new Worker(pathToMonochromeWorker, {
                    workerData: {
                        source: sourcePath,
                        destination: monochromeDestination
                    }
                })
                monochromeWorker.on('message', (message) => {
                    monochromeWorkerFinished = true;
                    resolve('monochromeWorker finished processing')
                }).on('error', (err) => {
                    reject(new Error(err.message));
                }).on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error('Exited with status code ' + code))
                    }
                })
            } catch (error) {
                reject(error)
            }
        } else {
            reject(new Error("not on main thread"))
        }
    })
}

module.exports = imageProcessor