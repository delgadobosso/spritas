export default function relativeTime(date) {
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    var current = new Date();
    var posted = new Date(date);
    var elapsed = current - posted;

    if (elapsed < minute) {
        if (Math.floor(elapsed / 1000) === 1) return `1 second ago`;
        else return `${Math.floor(elapsed / 1000)} seconds ago`;
    }
    else if (elapsed < hour) {
        if (Math.floor(elapsed / minute) === 1) return `1 minute ago`;
        else return `${Math.floor(elapsed / minute)} minutes ago`;
    }
    else if (elapsed < day) {
        if (Math.floor(elapsed / hour) === 1) return `1 hour ago`;
        else return `${Math.floor(elapsed / hour)} hours ago`;
    }
    else if (elapsed < week) {
        if (Math.floor(elapsed / day) === 1) return `1 day ago`;
        else return `${Math.floor(elapsed / day)} days ago`;
    }
    else if (elapsed < month) {
        if (Math.floor(elapsed / week) === 1) return `1 week ago`;
        else return `${Math.floor(elapsed / week)} weeks ago`;
    }
    else if (elapsed < year) {
        if (Math.floor(elapsed / month) === 1) return `1 month ago`;
        else return `${Math.floor(elapsed / month)} months ago`;
    } else {
        if (Math.floor(elapsed / year) === 1) return `1 year ago`;
        else return `${Math.floor(elapsed / year)} years ago`;
    }
}