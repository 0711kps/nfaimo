# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
Counter.create(name: 'Member')
Counter.create(name: 'Document')
Counter.create(name: 'TubeVid')
Member.create(name: '暫時的成員', title: '拋棄式成員', resp: '用來新增其他成員', ext: '0000', mail: 'temp-admin@nfa.gov.tw')
