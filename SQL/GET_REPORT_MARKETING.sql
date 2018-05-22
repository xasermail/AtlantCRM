/* Отчёты - Маркетинг */

if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_MARKETING') drop procedure dbo.GET_REPORT_MARKETING;

GO

create procedure [dbo].[GET_REPORT_MARKETING]
  @m_org_id int,
  @year int
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;


if object_id('tempdb..#tmonth') is not null drop table #tmonth;
create table #tmonth(
  id int identity not null primary key,
  month_num int not null,
  month_name varchar(500) not null
);
insert into #tmonth(month_num, month_name) values (1, 'Январь'), (2, 'Февраль'), (3, 'Март'), (4, 'Апрель'), (5, 'Май'), (6, 'Июнь'), (7, 'Июль'), (8, 'Август'), (9, 'Сентябрь'), (10, 'Октябрь'), (11, 'Ноябрь'), (12, 'Декабрь');

if object_id('tempdb..#report') is not null drop table #report;
create table #report(
  id int not null identity primary key,

	noviy int,
	seansi int,
	dni int,
	rodn int,
	vsego decimal(15,2),
	napoln decimal(15,2),
	prodaji int,
  
	tip varchar(50),
  dt smalldatetime,
  -- эта формула позволяет узнать номер недели внутри месяца, месяц
  -- может содержать вплоть до 6 недель
  week_number as datediff(week, dateadd(day, -1, dateadd(month, datediff(month, 0, dt), 0)), dateadd(day, -1, dt)) + 1,
  month_number as month(dt),
  name varchar(500)
);


if object_id('tempdb..#callresult') is not null drop table #callresult;
create table #callresult(
  id int not null identity primary key,

	noviy int,
	seansi int,
	dni int,
	rodn int,
	vsego int,
	napoln decimal(15,2),
	prodaji int,

);

-- по всем дням в году
declare @i int = 1;
declare @date0 smalldatetime = datefromparts(@year, 1, 1);
declare @date1 smalldatetime;
--
while (@date0 <= eomonth(datefromparts(@year, 12, 1))) begin

  set @date1 = @date0;
  --print @date1;

  delete from #callresult;
  insert into #callresult(noviy, seansi, dni, rodn, vsego, napoln, prodaji)
  exec dbo.GET_REPORT_MARKETING_DATA @m_org_id = @m_org_id, @date0 = @date0, @date1 = @date1;

  insert into #report(noviy, seansi, dni, rodn, vsego, napoln, prodaji, tip, dt)
  select
    noviy, seansi, dni, rodn, vsego, napoln, prodaji, 'day' tip, @date0 dt
  from
    #callresult;

  set @i = @i + 1;
  set @date0 = dateadd(day, 1, @date0);
end;

delete from #report where seansi = 0;

-- по каждому месяцу
insert into #report(noviy, seansi, dni, rodn, vsego, napoln, prodaji, tip, dt)
select
  sum(noviy), sum(seansi), sum(dni), sum(rodn), sum(vsego), round(sum(napoln) / count(*), 2), sum(prodaji), 'month' tip, DATEFROMPARTS(@year, month(r.dt), 1) dt
from
  #report r
group by
  month(r.dt);

-- по каждой неделе
insert into #report(noviy, seansi, dni, rodn, vsego, napoln, prodaji, tip, dt)
select
  sum(noviy), sum(seansi), sum(dni), sum(rodn), sum(vsego), round(sum(napoln) / count(*), 2), sum(prodaji), 'week' tip, datefromparts(@year, month(r.dt), day(min(r.dt))) dt
from
  #report r
where
  r.tip = 'day'
group by
  month(r.dt),
  r.week_number
order by
  month(r.dt),
  r.week_number;

-- итого
insert into #report(noviy, seansi, dni, rodn, vsego, napoln, prodaji, tip, dt)
select
  sum(noviy), sum(seansi), sum(dni), sum(rodn), sum(vsego), round(sum(napoln) / count(*), 2), sum(prodaji), 'year' tip, datefromparts(@year, 12, 31) dt
from
  #report r
where
  r.tip = 'month';

update r
	 set r.vsego = v.vsego
	from #report r
	join (
		select DATEFROMPARTS(@year, month(dt), 1) dt, r.week_number, round(sum(cast(vsego as float)) / cast(count(*) as float), 2) vsego
			from #report r
		 where tip = 'day'
			 and vsego > 0
		 group by month(r.dt), r.week_number
	) v on month(r.dt) = month(v.dt) and r.week_number = v.week_number
 where r.tip = 'week';

update r
	 set r.vsego = v.vsego
  from #report r
	join (
		select DATEFROMPARTS(@year, month(dt), 1) dt, round(sum(cast(vsego as float)) / cast(count(*) as float), 2) vsego
			from #report
		 where tip = 'day'
			 and vsego > 0
		 group by month(dt)
	) v on r.dt = v.dt
 where r.tip = 'month'

 update r
	 set r.vsego = (select round(sum(cast(vsego as float)) / cast(count(*) as float), 2) from #report r where tip = 'day' and vsego > 0)
	from #report r
 where r.tip = 'year';


-- проставляю наименования строк
update
  r
set
  r.name =
      case
        when r.tip = 'month' then (select u.month_name from #tmonth u where u.month_num = r.month_number)
        when r.tip = 'week' then cast(r.week_number as varchar(50)) + ' нед.'
        when r.tip = 'day' then cast(day(r.dt) as varchar(50)) + ' ' +
          case datepart(weekday, r.dt)
            when 1 then 'ПН.'
            when 2 then 'ВТ.'
            when 3 then 'СР.'
            when 4 then 'ЧТ.'
            when 5 then 'ПТ.'
            when 6 then 'СБ.'
            when 7 then 'ВС.'
          end
        when r.tip = 'year' then 'Всего'
      end
from
   #report r
;


select
  r.*
from
  #report r
order by
  r.month_number,
  r.week_number,
  case when r.tip = 'month' then 1
       when r.tip = 'week' then 2
       when r.tip = 'day' then 3
       when r.tip = 'year' then 4
  end
;



if object_id('tempdb..#tmonth') is not null drop table #tmonth;
if object_id('tempdb..#report') is not null drop table #report;

end; -- dbo.GET_REPORT_MARKETING

--go

--exec [dbo].[GET_REPORT_MARKETING] @m_org_id = 2, @year = 2017;