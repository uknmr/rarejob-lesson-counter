let startDate = new Date(2018, 2, 16)

chrome.storage.sync.get('referenceDate', result => {
  if (result.referenceDate) {
    startDate = new Date(result.referenceDate)
  }

  const now = new Date()
  const yesterday = new Date(now.setDate(now.getDate() - 1))
  const data = {
    startYear: startDate.getFullYear(),
    startMonth: startDate.getMonth() + 1,
    startDay: startDate.getDate(),
    endYear: yesterday.getFullYear(),
    endMonth: yesterday.getMonth() + 1,
    endDay: yesterday.getDate(),
  }

  countDate(data, response)
  addSpan(data)
})

const countDate = (data, callback) => {
  const xhr = new XMLHttpRequest()
  xhr.onload = () => callback(xhr)
  xhr.open('POST', '/ajax/lessonCountByDate/')
  xhr.setRequestHeader('Accept', 'text/html, */*; q=0.01')
  xhr.setRequestHeader(
    'Content-Type',
    'application/x-www-form-urlencoded; charset=UTF-8',
  )
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

  const dateQuery = Object.keys(data)
    .map(key => `${key}=${data[key]}`)
    .join('&')
  xhr.send(dateQuery)
}

const addSpan = data => {
  addMenu({
    label: '計測対象期間',
    value: `${data.startMonth}/${data.startDay}〜${endDate().getMonth() +
      1}/${endDate().getDate() - 1}`,
  })
}

const response = xhr => {
  const found = xhr.response.match(/\<strong\>(\d*)回/)
  const count = found ? parseInt(found[1]) : 0
  const elapsed = Math.trunc(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  const total = Math.trunc(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  // 残り日数
  addMenu({ label: '残日数', value: `${totalDateCount() - elapsed}日` })
  // 受講数
  addMenu({ label: '受講回数', value: `${count}回` })

  const paticipateRate = count ? rate(count, elapsed) : 0
  add(`の受講率は${paticipateRate}%です。`)

  caution({ count, elapsed, paticipateRate })
  fight({ count, elapsed, paticipateRate })
}

const caution = ({ count, elapsed, paticipateRate }) => {
  const total = totalDateCount()
  const borderLine = Math.floor(total * 0.7) // これではだめな受講回数
  const ngCount = total - borderLine // こんなに休んじゃだめな回数
  const dayOffCount = elapsed - count // 実際に休んだ回数
  const left = ngCount - dayOffCount // 休んじゃだめな残りの回数

  addMenu({ label: 'サボった回数', value: `${dayOffCount}回` })
  addMenu({ label: 'サボるとまずい回数', value: `${left}回` })

  if (paticipateRate >= 70 && dayOffCount) {
    add(`あと${left}回サボると挽回できません。`)
  }
}

const fight = ({ count, elapsed, paticipateRate }) => {
  if (paticipateRate >= 70) return

  for (let i = 1; ; i++) {
    const r = rate(count + i, elapsed + i)

    if (r >= 70) {
      add(`連続${i}回受講すると${r}%です！`)
      break
    }
  }
}

const endDate = () => {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 2)
  return endDate
}

const totalDateCount = () =>
  Math.trunc(
    (endDate().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  )

const rate = (count, elapsed) => (count / elapsed * 100).toFixed(1)

const add = text => {
  const target = document.querySelector('#profile_area span span')
  target.innerHTML += text
}

const addMenu = ({ label, value }) => {
  const menu = document.querySelector('#profile_detail > ul')
  const li = document.createElement('li')
  li.innerHTML = `
    <dl>
      <dt>${label}:</dt>
      <dd>${value}</dd>
    </dl>
  `
  menu.appendChild(li)
}
