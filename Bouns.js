function majorityElement(nums){
    let result = nums.reduce((acc,curr)=>{
        return acc == curr ? acc : curr
    })
    console.log(result)
}

majorityElement([2,2,1,1,1,2,2]) 
majorityElement([3,2,3])
