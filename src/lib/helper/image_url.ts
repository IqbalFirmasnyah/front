// export const convertTravelImageUrl = (image: string) => {
//     return {⁠http://localhost:3001/public/travel-images/${image})
// }
// export const convertCarImageUrl = (image: string) => {
//     return ⁠${process.env.NEXT_PUBLIC_CARS_API_URL}/public/car-images/${image} ⁠
// }

export const convertTravelImageUrl = (image: string)=>{
    return (`http://localhost:3001/public/travel-images/${image}`);
}
export const convertCarImageUrl = (fotoArmada: string)=>{
    return (`http://localhost:3001/public/car-images/${fotoArmada}`);
}
export const convertPackageImageUrl = (fotoPaketWisata: string)=>{
    return (`http://localhost:3001/public/package-images/${fotoPaketWisata}`);
}