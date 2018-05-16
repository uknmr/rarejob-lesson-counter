const referenceDateInput = document.getElementById('referenceDate')

referenceDateInput.addEventListener('change', () => {
  chrome.storage.sync.set({ referenceDate: referenceDateInput.value })
})

chrome.storage.sync.get(['referenceDate'], result => {
  if (result.referenceDate) {
    referenceDateInput.value = result.referenceDate
  }
})
