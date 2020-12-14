const gkutils = {
  dateToString: function (date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  },
  stringToDate: function (str) {
    const date = str.split('/')
    return new Date(`${date[1]}/${date[0]}/${date[2]}`)
  }
}
export default gkutils
