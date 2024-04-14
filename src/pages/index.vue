<template>
    <header>
        <div class="top">{{ `第${store.currentWeekIndex + 1}周${!store.isStart ? '(未开学)' : ''}` }}</div>
        <div class="week">
            <div class="month">{{ month }}月</div>
            <div class="day" v-for="(item, index) in currentWeekDayArray" :key="index">
                <div>{{ weekTitle[index] }}</div>
                <div>{{ item }}</div>
            </div>
        </div>
    </header>
    <main>
        <!-- 时间 -->
        <template v-for="(courseTime, courseIndex) in courseTimeList" :key="courseIndex">
        <div class="course-time">
          <div class="font-medium">
            {{ courseIndex + 1 }}
          </div>
          <div class="">
            {{ courseTime.s }}<br>{{ courseTime.e }}
          </div>
        </div>
      </template>
      <!-- 课表 -->
      <template v-for="(courseItem, _courseIndex) of deleteWeekCourse" :key="_courseIndex">
        <div
          :style="[getCoursePosition(courseItem), `background-color:${store.hasConflictCourseByMap(courseItem)[0].color}`]"
          @click="emit('courseItemClick', courseItem)"
        >
          <div>
            <div>
              {{ store.hasConflictCourseByMap(courseItem)[0].title }}
            </div>
            <div class="break-all">
              <!-- <div class="text-8px i-carbon-location-current" /> -->
              {{ store.hasConflictCourseByMap(courseItem)[0].location }}
            </div>
            <div
              v-if="store.hasConflictCourseByMap(courseItem).length > 1"
            />
          </div>
        </div>
      </template>

    </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCourseStore, courseTimeList } from '../stores/course'
import { weekTitle } from '../stores/course' // 引入周数对于中文数字 
import type { CourseModel } from '../stores/course'
import courses from '../assets/courses' // 课表数据
const weeks = ref([])
weeks.value = []


const store = useCourseStore()
// 设置开学时间
const someDate = new Date('2024-02-19');
someDate.getTime();
store.setStartDay(someDate)
// 当前月份
const month = store.currentMonth
// 获取星期对应日期
const currentWeekDayArray = store.currentWeekDayArray

const emit = defineEmits(['courseItemClick'])

// 格式化课表
store.setCourseList(courses as CourseModel[])

/**
 * get course position
 * @param item course item
 * @returns css style
 */
 function getCoursePosition(item: CourseModel) {
  return {
    'grid-row': `${item.start} / ${item.start + item.duration}`,
    'grid-column': `${item.week + 1} / ${item.week + 1 + 1}`,
  }
}

// delete a course when course at the same time
const deleteWeekCourse = computed(() => {
  const weekCourse = Array.from(store.weekCourseList)
  if (weekCourse.length <= 1)
    return weekCourse
  for (let i = 1; i < weekCourse.length; i++) {
    const { start, week } = weekCourse[i]
    const { start: prevStart, week: prevWeek } = weekCourse[i - 1]
    if (start === prevStart && week === prevWeek) {
      weekCourse.splice(i, 1)
      i--
    }
  }
  return weekCourse
})

</script>

<style scoped>
header {
    .top {
        text-align: center;
    }
    .week {
        .month {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        display: flex;
        &> div {
            flex: 1;
        }
    }
}
main {
    display: grid;
    grid-gap: 0.25rem;
    gap: 0.25rem;
    grid-auto-flow: column;
    grid-template-columns: 0.7fr repeat(7, 1fr);
    grid-template-rows: repeat(13, minmax(0, 1fr));
    .course-time {
        justify-content: space-evenly;
        align-items: center;
        display: flex;
        flex-direction: column;
    }
}
</style>