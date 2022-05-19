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
        if (Math.round(elapsed / 1000) === 1) return `${Math.round(elapsed / 1000)} second ago`;
        else return `${Math.round(elapsed / 1000)} seconds ago`;
    }
    else if (elapsed < hour) {
        if (Math.round(elapsed / minute) === 1) return `${Math.round(elapsed / minute)} minute ago`;
        else return `${Math.round(elapsed / minute)} minutes ago`;
    }
    else if (elapsed < day) {
        if (Math.round(elapsed / hour) === 1) return `${Math.round(elapsed / hour)} hour ago`;
        else return `${Math.round(elapsed / hour)} hours ago`;
    }
    else if (elapsed < month) {
        if (Math.round(elapsed / day) === 1) return `${Math.round(elapsed / day)} day ago`;
        else return `${Math.round(elapsed / day)} days ago`;
    }
    else if (elapsed < year) {
        if (Math.round(elapsed / month) === 1) return `${Math.round(elapsed / month)} month ago`;
        else return `${Math.round(elapsed / month)} months ago`;
    } else {
        if (Math.round(elapsed / year) === 1) return `${Math.round(elapsed / year)} year ago`;
        else return `${Math.round(elapsed / year)} years ago`;
    }
}