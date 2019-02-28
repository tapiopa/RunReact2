export default function Queue() {
    this.data = [];
    this.maxTime = 0;
}

Queue.prototype.setMaxTime = function (maximumTimeDifference) {
    this.maxTime = maximumTimeDifference;
};

Queue.prototype.add = function (record) {
    this.reduceQueue();
    // console.log("Queue, add, record", record);
    this.data.unshift(record);
};

Queue.prototype.reduceQueue = function () {
    if (this.hasAtLeastOneItem()) {
        if (this.timeDifference() > this.maxTime) {
            while (this.timeDifference() > this.maxTime) {
                this.remove();
            }
        }
    }
};

Queue.prototype.remove = function () {
    this.data.pop();
};

Queue.prototype.first = function () {
    return this.data[0];
};
Queue.prototype.last = function () {
    return this.data[this.data.length - 1];
};

Queue.prototype.firstTime = function () {
    if (this.hasAtLeastOneItem()) {
        return +this.first().timeStamp;
    }
    return null;
};

Queue.prototype.lastTime = function () {
    if (this.hasAtLeastOneItem()) {
        return +this.last().timeStamp;
    }
    return null;
};

Queue.prototype.timeDifference = function () {
    if (this.hasAtLeastOneItem()) {
        return this.firstTime() - this.lastTime();
    }
    return 0;
};

Queue.prototype.hasAtLeastOneItem = function () {
    return this.size() > 0;
};

Queue.prototype.size = function () {
    return this.data.length;
};

Queue.prototype.average = function () {
    this.reduceQueue();
    if (this.hasAtLeastOneItem()) {
        let n = 0;
        let total = this.data.reduce((total, item) => {
            n++;
            return total + +(item.speed);
        }, 0);
        return total/n;
    }
    return 0;
};
