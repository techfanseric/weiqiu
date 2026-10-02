export const getSuccessData = (data: any) => {
  return {
    code: 0,
    msg: 'ok',
    data
  }
}


export const getSuccessPageData = (data: any, total: number) => {
  return {
    code: 0,
    msg: 'ok',
    data:{
      data,
      total
    }
  }
}