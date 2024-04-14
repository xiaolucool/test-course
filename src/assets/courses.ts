import type { CourseModel } from '../stores/course'
import couresList from './coures.json'

// const arr = uni.getStorageSync('courses');
const arr = couresList

function parseWeeks(str: string) {
    const weeks: number[] = [];
    const ranges = str.split(',');

    ranges.forEach(range => {
        const parts = range.split('-');
        if (parts.length === 1) {
            weeks.push(parseInt(parts[0]));
        } else {
            const start = parseInt(parts[0]);
            const end = parseInt(parts[1].match(/\d+/)![0]);
            for (let i = start; i <= end; i++) {
                weeks.push(i);
            }
        }
    });

    return weeks;
}

function parseRange(rangeStr: string) {
    const [start, end] = rangeStr.split('-').map(num => parseInt(num));
    return {
        start: start,
        duration: end - start + 1
    };
}

let list = <CourseModel[]>[]
//   console.log(arr.kbList);
arr.kbList.forEach((element) => {
    const { start, duration } = parseRange(element.jc)
    const CourseModel = {
        title: element.kcmc,
        location: element.cdmc,
        week: Number(element.xqj),
        weeks: parseWeeks(element.zcd),
        start,
        duration
    }
    list.push(CourseModel)
})

export default list
