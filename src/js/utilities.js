const gkutils = {
  dateToString: function (date) {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}` // yyyy/mm/dd
  },
  stringToDate: function (str) {
    const date = str.split('/')
    return new Date(`${date[1]}/${date[2]}/${date[1]}`) // mm/dd/yyyy
  }
}
export default gkutils
