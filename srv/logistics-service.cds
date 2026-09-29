using { exam.logistics as my } from '../db/schema';
 
@path: '/logistics'
service LogisticsService {
    entity Shipments as projection on my.Shipments;
    @readonly entity Packages as projection on my.Packages;
}
