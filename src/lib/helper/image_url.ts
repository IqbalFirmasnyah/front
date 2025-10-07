// export const convertTravelImageUrl = (image: string) => {
//     return {⁠${process.env.NEXT_PUBLIC_API_URL}/public/travel-images/${image})
// }
// export const convertCarImageUrl = (image: string) => {
//     return ⁠${process.env.NEXT_PUBLIC_CARS_API_URL}/public/car-images/${image} ⁠
// }

export const convertTravelImageUrl = (image: string)=>{
    return (`${process.env.NEXT_PUBLIC_API_URL}/public/travel-images/${image}`);
}
export const convertCarImageUrl = (fotoArmada: string)=>{
    return (`${process.env.NEXT_PUBLIC_API_URL}/public/car-images/${fotoArmada}`);
}
export const convertPackageImageUrl = (fotoPaketWisata: string)=>{
    return (`${process.env.NEXT_PUBLIC_API_URL}/public/package-images/${fotoPaketWisata}`);
}