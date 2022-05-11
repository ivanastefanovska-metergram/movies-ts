import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Movie {
    @PrimaryColumn()
    imdbId!: string

    @Column()
    title!: string

    @Column()
    year!: string

    @Column()
    runtime!: number

    @Column("float")
    imdbRating!: number

    @Column()
    imdbVotes!: number
}