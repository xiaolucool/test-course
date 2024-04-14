import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export interface CourseModel {
  title: string
  location: string
  start: number
  duration: number
  // [1-7]
  week: number
  // [[1-20]]
  weeks: number[]
  color?: string
}

export const weekTitle = ['一', '二', '三', '四', '五', '六', '日']

export const courseTimeList = [
  { s: '08:30', e: '09:15' }, { s: '09:20', e: '10:05' },
  { s: '10:25', e: '11:15' }, { s: '11:20', e: '12:00' },
  { s: '12:10', e: '12:55' }, { s: '13:00', e: '13:45' },
  { s: '14:45', e: '14:45' }, { s: '14:50', e: '15:35' },
  { s: '15:45', e: '16:30' }, { s: '16:35', e: '17:20' },
  { s: '17:30', e: '18:15' }, { s: '18:30', e: '19:15' },
  { s: '19:20', e: '20:05' }
]

const colorMap = new Map<string, string>()

// @unocss-include
export const colorList = [
  ['#FFDC72', '#CE7CF4', '#FF7171', '#66CC99', '#FF9966', '#66CCCC', '#6699CC', '#99CC99', '#669966', '#66CCFF', '#99CC66', '#FF9999', '#81CC74'],
  ['#99CCFF', '#FFCC99', '#CCCCFF', '#99CCCC', '#A1D699', '#7397db', '#ff9983', '#87D7EB', '#99CC99'],
]

const conflictCourseMap = new Map<CourseModel, CourseModel[]>()

export const useCourseStore = defineStore(
  'course',
  () => {
    const isStart = ref<boolean>(false)
    const startDate = ref<Date | string>(new Date())
    const weekNum = ref<number>(20)
    const courseList = ref<CourseModel[]>([])
    const currentMonth = ref<number>(0)
    const originalWeekIndex = ref<number>(0)
    const currentWeekIndex = ref<number>(0)
    const originalWeekWeekIndex = ref<number>((new Date().getDay()) === 0 ? 6 : (new Date().getDay()) - 1)
    const colorArrayIndex = ref<number>(0)

    /**
     * 设置开始日期
     * @param someDate 学期的开始日期
     */
    function setStartDay(someDate: string | Date) {
      startDate.value = new Date(someDate)
      const days = new Date().getTime() - startDate.value.getTime()
      isStart.value = days > 0
      const week = Math.floor(days / (1000 * 60 * 60 * 24 * 7))
      originalWeekIndex.value = week < 0 ? 0 : week
      setCurrentWeekIndex(originalWeekIndex.value)
    }

    /**
     * 更改本周指数
     * @param weekIndex 新周索引
     */
    function setCurrentWeekIndex(weekIndex: number) {
      conflictCourseMap.clear()
      currentWeekIndex.value = weekIndex
      // 更改当前月份
      const someDate = new Date(startDate.value)
      someDate.setDate(someDate.getDate() + weekIndex * 7)
      currentMonth.value = someDate.getMonth() + 1
    }

    /**
     * 初始化课程列表
     * @param newCourseList 新课程列表
     */
    function setCourseList(newCourseList: CourseModel[]) {
      conflictCourseMap.clear()
      // 按周排序并开始
      courseList.value = newCourseList.sort((a, b) => a.week - b.week || a.start - b.start)
      resetCourseBgColor()
    }

    // 本周课程列表
    const weekCourseList = computed(() => {
      if (courseList.value)
        return courseList.value.filter(item => item.weeks.includes(currentWeekIndex.value + 1))
      return []
    })

    // 课程行动数据
    const parsedCourseList = computed(() => {
      // 初始化课程数组
      const parsedCourseList = Array.from({ length: weekNum.value },
        () => Array.from({ length: 7 },
          () => Array.from({ length: 5 },
            () => 0)))

      if (courseList.value) {
        // 处理课程列表
        for (const courseItem of courseList.value) {
          const { start, duration, week, weeks } = courseItem
          for (const w of weeks) {
            const dayCourseList = parsedCourseList[w - 1][week - 1]
            dayCourseList[Math.floor(start / 2)]++
            // 有些课程可能会持续两次以上
            if (duration > 2)
              dayCourseList[Math.floor(start / 2 + 1)]++
          }
        }
      }
      return parsedCourseList
    })

    // 本周日期列表
    const currentWeekDayArray = computed(() => {
      const weekIndex = currentWeekIndex.value
      const someDate = new Date(startDate.value)
      someDate.setDate(someDate.getDate() + weekIndex * 7)
      const dayArray: number[] = []
      dayArray.push(someDate.getDate())
      for (let i = 0; i < 6; i++) {
        someDate.setDate(someDate.getDate() + 1)
        dayArray.push(someDate.getDate())
      }
      return dayArray
    })

    /**
     * 特定课程项目时间的课程列表
     * @param courseItem 课程项目
     */
    function getConflictCourse(courseItem: CourseModel): CourseModel[] {
      if (!courseItem)
        return []
      const { week, start } = courseItem
      return courseList.value.filter((item) => {
        return item.weeks.includes(currentWeekIndex.value + 1) && item.week === week && item.start === start
      })
    }

    /**
     * 特定课程项目时间的课程列表以及地图
     * @param courseItem 课程项目
     */
    function hasConflictCourseByMap(courseItem: CourseModel): CourseModel[] {
      if (!conflictCourseMap.has(courseItem))
        conflictCourseMap.set(courseItem, getConflictCourse(courseItem))
      return conflictCourseMap.get(courseItem) || []
    }

    /**
     * 重置课程背景颜色
     */
    function resetCourseBgColor() {
      colorMap.clear()
      if (courseList.value) {
        courseList.value.map(courseItem =>
          Object.assign(courseItem, { color: getCourseColor(courseItem) }),
        )
      }
    }

    /**
     * get course item color
     * @param courseItem course item
     * @returns course color
     */
    function getCourseColor(courseItem: CourseModel): string {
      const colorArray = colorList[colorArrayIndex.value]
      const { title } = courseItem
      if (!colorMap.has(title))
        colorMap.set(title, colorArray[colorMap.size % colorArray.length])
      return colorMap.get(title) || 'bg-white'
    }

    watch(
      () => colorArrayIndex.value,
      () => resetCourseBgColor(),
    )

    /**
     * 当同时有多个课程时，将一门课程设置为顶部
     * @param courseItem 课程项目
     */
    function setCourseItemTop(courseItem: CourseModel) {
      deleteCourseItem(courseItem)
      courseList.value.unshift(courseItem)
    }

    /**
     * 删除课程
     * @param courseItem 课程项目
     */
    function deleteCourseItem(courseItem: CourseModel) {
      conflictCourseMap.clear()
      const { title, week, start } = courseItem
      for (let i = 0; i < courseList.value.length; i++) {
        const item = courseList.value[i]
        if (item.title === title && item.week === week && item.start === start)
          courseList.value.splice(i, 1)
      }
    }

    /**
     * 按标题删除课程
     * @param courseTitle 课程名称
     */
    function deleteCourseItemByTitle(courseTitle: string) {
      conflictCourseMap.clear()
      for (let i = 0; i < courseList.value.length; i++) {
        const item = courseList.value[i]
        if (item.title === courseTitle)
          courseList.value.splice(i, 1)
      }
    }

    return {
      isStart,
      startDate,
      weekNum,
      currentMonth,
      courseList,
      setCourseList,
      weekCourseList,
      parsedCourseList,
      originalWeekIndex,
      currentWeekIndex,
      originalWeekWeekIndex,
      currentWeekDayArray,
      colorArrayIndex,
      setStartDay,
      setCurrentWeekIndex,
      getConflictCourse,
      hasConflictCourseByMap,
      setCourseItemTop,
      deleteCourseItem,
      deleteCourseItemByTitle,
    }
  },
)

// 需要在设置之外使用
// export function useCourseStoreWidthOut() {
//   return useCourseStore(pinia)
// }
