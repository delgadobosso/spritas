export default function relativeTime(date) {
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = day * 365;

    var current = new Date();
    var posted = new Date(date);
    var elapsed = current - posted;

    if (elapsed < minute) {
        if (Math.floor(elapsed / 1000) === 1) return `a second ago`;
        else return `${Math.floor(elapsed / 1000)} seconds ago`;
    }
    else if (elapsed < hour) {
        if (Math.floor(elapsed / minute) === 1) return `a minute ago`;
        else return `${Math.floor(elapsed / minute)} minutes ago`;
    }
    else if (elapsed < day) {
        if (Math.floor(elapsed / hour) === 1) return `an hour ago`;
        else return `${Math.floor(elapsed / hour)} hours ago`;
    }
    else if (elapsed < month) {
        if (Math.floor(elapsed / day) === 1) return `yesterday`;
        else return `${Math.floor(elapsed / day)} days ago`;
    }
    else if (elapsed < year) {
        if (Math.floor(elapsed / month) === 1) return `last month`;
        else return `${Math.floor(elapsed / month)} months ago`;
    } else {
        if (Math.floor(elapsed / year) === 1) return `last year`;
        else return `${Math.floor(elapsed / year)} years ago`;
    }
}