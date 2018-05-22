/* получить данные для режима База */

if exists(select 1 from sys.procedures as a where a.name = 'GET_BAZA_LIST') drop procedure dbo.GET_BAZA_LIST;

GO

create procedure [dbo].[GET_BAZA_LIST]
  -- номер страницы
	@page int,
  -- количество записей на странице
	@rows_per_page int,
	-- организация
	@m_org_id int,
	-- ФИО
	@fio varchar(500) = '',
	-- ходит/не ходит/на дату (1 - ходит, 2 - не ходит, 3 - на дату)
	@posHodit int = 0,
	-- ходит/не ходит/на дату, дней (когда выбрано 1 - ходит или 2 - не ходит)
	@posDn int = 0,
  -- ходит/не ходит/на дату, дата (когда выбрано 3 - на дату) 
  @posNaDatu smalldatetime = null,
	-- заболевание
	@zabolId int = 0,
	-- посещения с
	@periodS smalldatetime = null,
	-- посещения по
	@periodPo smalldatetime = null,
	-- кол-во регистраций с
	@regS int = 0,
	-- кол-во регистраций по
	@regPo int = 0,
	-- время сеанса
	@seansId int = 0,
	-- проданные товары
	@productIds varchar(500) = '',
	-- группа заболевания
	@kategId int = 0,
	-- улучшения
	@uluchId int = 0,
	-- доп фильтр
	@dopFilter varchar(500) = '',
  -- дата звонка
  @dZv smalldatetime = null,
  -- направление сортировки по d_zv
  -- 0 - без сортировки, 1 - сортировка по возрастанию, 2 - сортировка по убыванию
  @dZvOrderBy int = 0
as begin

set datefirst 1;
set nocount on;
set ansi_warnings off;

if (@periodS = datefromparts(1900, 1, 1)) begin
  set @periodS = null;
end;

if (@periodPo = datefromparts(1900, 1, 1)) begin
  set @periodPo = null;
end;


declare @getDate smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);

/*
  не ходит - текущий день не считается
  не ходит - не учитывается человек, который предварительно записан на
             ненаступившую ещё дату
*/

declare @neHoditS smalldatetime = isnull(@periodPo, @getDate);

-- таблица рабочих дней за количество дней по фильтру Период
declare @rabDni table(dn smalldatetime);

-- вычисляю дату, с которой он должен не ходить, чтобы получить
-- промежуток в указанное количество дней. сегодняшний день не считается
declare @loopCounter int = 0;
if (@posDn > 0) begin
  declare @i int = @posDn;
	while (@i > 0) begin
	  set @neHoditS = @neHoditS - 1;
		-- если день среди рабочих
		if (datepart(dw, @neHoditS) in (select dd.DAY_ID from dbo.M_WORK_DAY dd where dd.M_ORG_ID = @m_org_id)) begin
	   set @i = @i - 1;
		 insert into @rabDni(dn) values(@neHoditS);
		end;
		set @loopCounter = @loopCounter + 1;
		if (@loopCounter > 1000) begin
		  raiserror('Ошибка при определении даты с которой не должен ходить человек', 15, 1);
			return;
		end;
	end;
end;
--
-- предыдущий день, с того дня, с которого он должен был
-- перестать ходить, это будет сравниваться с последним
-- днем, когда он был
set @loopCounter = 0;
declare @neHoditSPred smalldatetime = @neHoditS;
if (@posDn > 0) begin
	set @i = 1;
	while (@i > 0) begin
		set @neHoditSPred = @neHoditSPred - 1;
		-- если день среди рабочих
		if (datepart(dw, @neHoditSPred) in (select dd.DAY_ID from dbo.M_WORK_DAY dd where dd.M_ORG_ID = @m_org_id)) begin
			set @i = @i - 1;
		end;
		set @loopCounter = @loopCounter + 1;
		if (@loopCounter > 1000) begin
			raiserror('Ошибка при определении предыдущего дня к дате с которой не должен ходить человек', 15, 1);
			return;
		end;
	end;
end;

-- текущий день не считается по количеству, но если фильтр Не ходит,
-- 5 дней, но при этом сегодня он пришёл - то человек не должен попасть
-- в результат, а вот если он сегодня не был, то 5 дней назад считается
-- начиная со вчерашнего дня, не с сегодняшнего
declare @neHoditPo smalldatetime = isnull(@periodPo, @getDate);

/*
print @neHoditS
print @neHoditSPred
print @neHoditPo
*/


-- признак поиска людей, у которых нет ни одного купленного товара
declare @netTovara int = 0;
if (@productIds = '-1') begin
  set @netTovara = 1;
  set @productIds = '';
end;


-- сначала считаю количество записей
declare @cnt int;
select
  @cnt = count(*)
from
  dbo.O_ANK o
where
  o.M_ORG_ID = @m_org_id
  -- ВСЕ УСЛОВИЯ ДОПИСЫВАТЬ ЕЩЁ И В ЗАПРОСЕ СНИЗУ
  and (isnull(o.SURNAME + ' ', '') + isnull(o.NAME + ' ', '') + isnull(o.SECNAME, '') like '%' + @fio + '%'
		or isnull(dbo.phoneAsNumber(o.PHONE_MOBILE), '') like '%' + dbo.phoneAsNumber(@fio) + '%'
		or isnull(dbo.phoneAsNumber(o.[PHONE_HOME]), '') like '%' + dbo.phoneAsNumber(@fio) + '%'
		or isnull(o.[CITY] + ' ','') + isnull(o.[STREET] + ' ', '') + isnull(o.[HOUSE] + ' ','') + isnull(o.[CORPUS] + ' ','') + isnull(o.[FLAT] + ' ','') like '%' + @fio + '%'
		or cast(o.ID as varchar(50)) = @fio)
	and (@posHodit = 0 or
	     @posHodit = 1 and
			 not exists(
			   -- все рабочие дни, за указанное количество дней в Периоде
			   select
				   d.dn
			   from
				   @rabDni d
				 except
				 -- минус все дни, которые он реально был, если после вычитания
				 -- будет ноль, значит он все дни ходил
			   select
				   cast(isnull(s.D_REG, s.D_START) as date)
				 from
				   dbo.O_SEANS s
				 where
				   s.O_ANK_ID = o.ID
					 and s.SEANS_STATE = 1
					 and cast(isnull(s.D_REG, s.D_START) as date) between @neHoditS and @neHoditPo
				 
			 ) or 
			 @posHodit = 2 and
       -- не ходил с указанного дня ни разу
			 not exists(
			   select
				   *
				 from
				   dbo.O_SEANS s
				 where
				   s.O_ANK_ID = o.ID
					 and s.SEANS_STATE = 1
					 and cast(isnull(s.D_REG, s.D_START) as date) between @neHoditS and @neHoditPo
			 ) and
			 -- но за день до этого - был
			 exists(
			   select
				   *
				 from
				   dbo.O_SEANS s
				 where
				   s.O_ANK_ID = o.ID
					 and s.SEANS_STATE = 1
					 and cast(isnull(s.D_REG, s.D_START) as date) = @neHoditSPred
			 )
       -- если есть предварителная запись на день, который ещё
       -- не наступил, то не учитыываю, считается, что он не ходит, но ему
       -- уже позвонили и записали на сеанс, значит ситуация отработана
       and not exists(
         select
           *
         from
           dbo.O_SEANS s
         where
           s.O_ANK_ID = o.ID
           and s.SEANS_STATE = 0
           and s.SEANS_DATE > @getDate
       )
       -- на дату
       or @posHodit = 3 and not exists(
         select
           *
         from
           dbo.O_SEANS s
         where
           s.O_ANK_ID = o.ID
           and s.SEANS_STATE = 1
           and cast(isnull(s.D_REG, s.D_START) as date) > cast(@posNaDatu as date)
       )
  )
	and (@zabolId = 0 or exists(
		select
			*
		from
			dbo.O_ANK_ZABOL z
		where
			z.O_ANK_ID = o.ID
			and z.M_ZABOL_ID = @zabolId
	))
	and (@periodS is null or @periodPo is null or (
		exists(
			select *
				from dbo.O_SEANS s
				where s.O_ANK_ID = o.ID
					and s.SEANS_STATE = 1
					and cast(isnull(s.D_REG, s.D_START) as date) between @periodS and @periodPo
		)
	))
	and (@regS = 0 or @regPo = 0 or (
		exists (
			select 1
				from dbo.O_SEANS s
				where s.O_ANK_ID = o.ID
					and s.SEANS_STATE = 1
					and s.D_REG is not null
				group by s.O_ANK_ID
			having count(*) between @regS and @regPo
		)
	))
	and (@seansId = 0 or exists(
		select *
			from dbo.O_SEANS s
			where s.O_ANK_ID = o.ID
				and s.SEANS_STATE = 1
				and s.M_SEANS_TIME_ID = @seansId
	))
	and (isnull(@productIds,'') = '' or exists(
		select 1
			from o_sklad_ras r
			join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
			join o_sklad_ras_product_opl op on op.o_sklad_ras_product_id = p.id
			join m_product m on p.m_product_id = m.id
			where r.O_ANK_ID = o.ID
				and isnull(p.OPL_OST,0) = 0
				and ','+@productIds+',' like '%,'+cast(m.ID as varchar(50))+',%'
	))
	and (@kategId = 0 or exists(
		select 1
			from dbo.O_ANK_ZABOL az
			join dbo.M_ZABOL z on z.ID = az.M_ZABOL_ID
			join dbo.M_ZABOL_GROUP zg on z.M_ZABOL_GROUP_ID = zg.ID
			where az.O_ANK_ID = o.ID
				and zg.ID = @kategId
	))
	and (@uluchId = 0 or exists(
		select 1
			from O_VIPIS v
			join O_VIPIS_ULUCH vu on v.ID = vu.O_VIPIS_ID
			where v.O_ANK_ID = o.ID
				and vu.M_ZABOL_ID = @uluchId
	))
  and (@netTovara = 0 or not exists(
    select
      *
    from
      dbo.O_SKLAD_RAS r
    where
      r.O_ANK_ID = o.ID
  ))
  -- нет активности в режиме Звонки после указанной даты #405
  and (@dZv is null or not exists(
    select
      1 a
    from
      dbo.O_ZVONOK z
    where 
      z.O_ANK_ID = o.ID
      and cast(z.D_START as date) >= cast(@dZv as date)
    union all
    -- запись на сеанс из режима Звонки тоже считается звонком
    select
      1 a
    from
      dbo.O_SEANS s
    where
      s.O_ANK_ID = o.ID
      and s.FROM_ZVONOK = 1
      and cast(s.D_START as date) >= cast(@dZv as date)
  ))
;


-- даты для определения дней рождения сегодня, на этой неделе, в этом месяце
declare @now smalldatetime = cast(dbo.CREATE_DATE(@m_org_id) as date);
declare @dayNumber int = DATEDIFF(DAY,0, @now)%7;
declare @thisWeekStart smalldatetime = @now,
				@thisWeekEnd smalldatetime = @now,
				@thisMonthStart smalldatetime = dateadd(day,1-day(@now),@now),
				@thisMonthEnd smalldatetime = dateadd(month,1,dateadd(day,1-day(@now),@now))-1;

-- нулевой день - понедельник, воскресенье - 6-й
if (@dayNumber >= 0) begin
	set @thisWeekStart = @thisWeekStart - @dayNumber;
	set @thisWeekEnd = @thisWeekStart + 6;
end;

-- основной запрос, который возвращает данные для режима
if object_id('tempdb..#data') is not null drop table #data;
select
  o.ID id,
  o.ID_CODE kod,
	isnull(o.SURNAME + ' ', '') + isnull(o.NAME + ' ', '') + isnull(o.SECNAME, '') fio,
	o.[BIRTHDAY] birthday, 
	isnull(o.PHONE_MOBILE, o.PHONE_HOME) phone,
	-- количество посещений
	(select count(*) from dbo.O_SEANS s where s.O_ANK_ID = o.ID and s.SEANS_STATE = 1) visit_count,

	-- последнее посещение
  (select
	   max(cast(case when s.BEZ_REG = 1 then s.D_START else s.D_REG end as date))
	 from
	   dbo.O_SEANS s
	where
	  s.O_ANK_ID = o.ID
		and s.SEANS_STATE = 1
	) last_visit,

  (select
	   max(d_schet)
	 from
	   dbo.o_sklad_ras r
	where
	  r.O_ANK_ID = o.ID
	) last_sale,

	-- специалист
	(select
	   isnull(u.SURNAME + ' ', '') + isnull(left(u.NAME, 1) + '. ', '') + isnull(left(u.SECNAME, 1) + '.', '')
	 from
	   dbo.S_USER u
	 where
	   u.ID = o.USER_REG
	) reg_fio,

	-- зарегистрирован сегодня (новенький, для подсветки)
	case when cast(o.DATE_REG as date) = cast(dbo.CREATE_DATE(@m_org_id) as date) then 1 else 0 end is_registered_today,

	-- количество записей всего
	@cnt cnt,

	-- для работы фильтра при выбранной ссылке на боковой панели
	-- улучшения - сегодня, завтра
	isnull(
		(select top 1
						case
							when cast(v.D_ULUCH as date) = cast(dbo.CREATE_DATE(@m_org_id) as date) then 1
							when cast(v.D_ULUCH as date) = cast(dbo.CREATE_DATE(@m_org_id) + 1 as date) then 2
							else 0
						end 
			 from dbo.O_VIPIS v 
			where v.O_ANK_ID = o.ID),
	0) uluch_day_id,

	-- дни рождения
	case
		when month(o.birthday)=month(@now) and day(o.birthday)=day(@now) then 1	
		else 0
	end birth_now, -- сегодня
	case -- абсолютная дата в рамках года, без учета реального кол-ва дней в месяце
		when day(o.birthday)+(month(o.birthday)*30) between day(@thisWeekStart)+(month(@thisWeekStart)*30) and day(@thisWeekEnd)+(month(@thisWeekEnd) * 30) then 1 
		else 0
	end birth_week, -- на этой неделе
	case
		when month(o.birthday) = month(@thisMonthStart) then 1 -- в этом месяце
		else 0
	end birth_month

  -- последний звонок
  ,zv.D_START d_start_last_zv
  ,zv.fio fio_last_zv
  ,zv.COMMENT comment_last_zv
	,o.SEX
  ,(
    select
      max(s.D_START) D_START
    from
      dbo.O_SEANS s
    where
      s.O_ANK_ID = o.ID
      and s.FROM_ZVONOK = 1
  ) d_start_seans_from_zvonok
  -- дата последнего звонка/сеанса из режима Звонки
  ,cast(null as smalldatetime) d_zv -- обновляется ниже
into
  #data
from
  dbo.O_ANK o
  outer apply(
    select top 1
      zv.D_START,
      isnull(u.SURNAME + ' ', '') + isnull(left(u.NAME, 1) + '. ', '') + isnull(left(u.SECNAME, 1) + '.', '') fio,
      zv.COMMENT,
      zv.O_ANK_ID
    from
      dbo.O_ZVONOK zv
      left join dbo.S_USER u on u.ID = zv.USERID
    where
      zv.O_ANK_ID = o.ID 
    order by
      zv.D_START desc
  ) zv 
where
  o.M_ORG_ID = @m_org_id
  -- ВСЕ УСЛОВИЯ ДОПИСЫВАТЬ ЕЩЁ И В ЗАПРОСЕ СВЕРХУ
  and  (isnull(o.SURNAME + ' ', '') + isnull(o.NAME + ' ', '') + isnull(o.SECNAME, '') like '%' + @fio + '%'
		or isnull(dbo.phoneAsNumber(o.PHONE_MOBILE), '') like '%' + dbo.phoneAsNumber(@fio) + '%'
		or isnull(dbo.phoneAsNumber(o.[PHONE_HOME]), '') like '%' + dbo.phoneAsNumber(@fio) + '%'
		or isnull(o.[CITY] + ' ','') + isnull(o.[STREET] + ' ', '') + isnull(o.[HOUSE] + ' ','') + isnull(o.[CORPUS] + ' ','') + isnull(o.[FLAT] + ' ','') like '%' + @fio + '%'
		or cast(o.ID as varchar(50)) = @fio)
	and (@posHodit = 0 or
	     -- ходит все дни
	     @posHodit = 1 and
			 not exists(
			   -- все рабочие дни, за указанное количество дней в Периоде
			   select
				   d.dn
			   from
				   @rabDni d
				 except
				 -- минус все дни, которые он реально был, если после вычитания
				 -- будет ноль, значит он все дни ходил
			   select
				   cast(isnull(s.D_REG, s.D_START) as date)
				 from
				   dbo.O_SEANS s
				 where
				   s.O_ANK_ID = o.ID
					 and s.SEANS_STATE = 1
					 and cast(isnull(s.D_REG, s.D_START) as date) between @neHoditS and @neHoditPo
				 
			 ) or
			 @posHodit = 2 and
       -- не ходил с указанного дня ни разу
			 not exists(
			   select
				   *
				 from
				   dbo.O_SEANS s
				 where
				   s.O_ANK_ID = o.ID
					 and s.SEANS_STATE = 1
					 and cast(isnull(s.D_REG, s.D_START) as date) between @neHoditS and @neHoditPo
			 ) and
			 -- но за день до этого - был
			 exists(
			   select
				   *
				 from
				   dbo.O_SEANS s
				 where
				   s.O_ANK_ID = o.ID
					 and s.SEANS_STATE = 1
					 and cast(isnull(s.D_REG, s.D_START) as date) = @neHoditSPred
			 )
       -- если есть предварителная запись на день, который ещё
       -- не наступил, то не учитыываю, считается, что он не ходит, но ему
       -- уже позвонили и записали на сеанс, значит ситуация отработана
       and not exists(
         select
           *
         from
           dbo.O_SEANS s
         where
           s.O_ANK_ID = o.ID
           and s.SEANS_STATE = 0
           and s.SEANS_DATE > @getDate
       )
       -- на дату
       or @posHodit = 3 and not exists(
         select
           *
         from
           dbo.O_SEANS s
         where
           s.O_ANK_ID = o.ID
           and s.SEANS_STATE = 1
           and cast(isnull(s.D_REG, s.D_START) as date) > cast(@posNaDatu as date)
       )
  )
	and (@zabolId = 0 or exists(
	  select
		  *
		from
		  dbo.O_ANK_ZABOL z
		where
		  z.O_ANK_ID = o.ID
			and z.M_ZABOL_ID = @zabolId
	))
	and (@periodS is null or @periodPo is null or (
	  exists(
		  select
			  *
			from
			  dbo.O_SEANS s
			where
			  s.O_ANK_ID = o.ID
				and s.SEANS_STATE = 1
				and cast(isnull(s.D_REG, s.D_START) as date) between @periodS and @periodPo
		)
	))
	and (@regS = 0 or @regPo = 0 or (
		exists (
			select 1
				from dbo.O_SEANS s
			 where s.O_ANK_ID = o.ID
				 and s.SEANS_STATE = 1
				 and s.D_REG is not null
			 group by s.O_ANK_ID
		  having count(*) between @regS and @regPo
		)
	))
	and (@seansId = 0 or exists(
		select *
			from dbo.O_SEANS s
			where s.O_ANK_ID = o.ID
				and s.SEANS_STATE = 1
				and s.M_SEANS_TIME_ID = @seansId
	))
	and (isnull(@productIds,'') = '' or exists(
		select 1
			from o_sklad_ras r
			join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
			join o_sklad_ras_product_opl op on op.o_sklad_ras_product_id = p.id
			join m_product m on p.m_product_id = m.id
			where r.O_ANK_ID = o.ID
				and isnull(p.OPL_OST,0) = 0
				and ','+@productIds+',' like '%,'+cast(m.ID as varchar(50))+',%'
	))
	and (@kategId = 0 or exists(
		select 1
			from dbo.O_ANK_ZABOL az
			join dbo.M_ZABOL z on z.ID = az.M_ZABOL_ID
			join dbo.M_ZABOL_GROUP zg on z.M_ZABOL_GROUP_ID = zg.ID
			where az.O_ANK_ID = o.ID
				and zg.ID = @kategId
	))
	and (@uluchId = 0 or exists(
		select 1
			from O_VIPIS v
			join O_VIPIS_ULUCH vu on v.ID = vu.O_VIPIS_ID
			where v.O_ANK_ID = o.ID
				and vu.M_ZABOL_ID = @uluchId
	))
  and (@netTovara = 0 or not exists(
    select
      *
    from
      dbo.O_SKLAD_RAS r
    where
      r.O_ANK_ID = o.ID
  ))
  -- нет активности в режиме Звонки после указанной даты #405
  and (@dZv is null or not exists(
    select
      1 a
    from
      dbo.O_ZVONOK z
    where 
      z.O_ANK_ID = o.ID
      and cast(z.D_START as date) >= cast(@dZv as date)
    union all
    -- запись на сеанс из режима Звонки тоже считается звонком
    select
      1 a
    from
      dbo.O_SEANS s
    where
      s.O_ANK_ID = o.ID
      and s.FROM_ZVONOK = 1
      and cast(s.D_START as date) >= cast(@dZv as date)
  ))
;


if (CHARINDEX('sex',@dopFilter) > 0) begin
  delete from #data where @dopFilter not like '%sex:' + cast(isnull(sex,0) as varchar(10)) + ';%';
end;

if (CHARINDEX('uluch',@dopFilter) > 0) begin
  delete from #data where  @dopFilter not like '%uluch:' + cast(uluch_day_id as varchar(10)) + ';%';
end;

if (CHARINDEX('birth',@dopFilter) > 0) begin
	if (@dopFilter like '%birth:1;%') begin
		delete from #data where birth_now != 1;
	end;
	if (@dopFilter like '%birth:2;%') begin
		delete from #data where birth_week != 1;
	end;
	if (@dopFilter like '%birth:3;%') begin
		delete from #data where birth_month != 1;
	end;
end;

if (CHARINDEX('tovar',@dopFilter) > 0) begin
	delete d from #data d
	 where not exists (
		select *
			from dbo.O_SKLAD_RAS r
			join dbo.O_SKLAD_RAS_PRODUCT p on p.O_SKLAD_RAS_ID = r.ID
			where r.M_ORG_ID = @m_org_id
				and r.O_ANK_ID = d.ID
				and isnull(p.OPL_OST,0) = 0
				and isnull(p.COST,0) > 0
				and @dopFilter like '%tovar:' + cast(p.M_PRODUCT_ID as varchar(10)) + ';%');
end;

if (CHARINDEX('status',@dopFilter) > 0) begin
	delete d from #data d
	 where not exists (
		select *
			from dbo.O_STATUS s
			where s.M_ORG_ID = @m_org_id
				and s.O_ANK_ID = d.ID
				and @dopFilter like '%status:' + cast(s.M_STATUS_ID as varchar(10)) + ';%');
end;

select @cnt = count(*) from #data;

update
  #data
set
  cnt = @cnt
;


update
  #data
set
  d_zv = (-- просто получаю максимальное из 2х значений
           select
             max(x.dt) dt
           from (
             select
               d_start_last_zv dt
             union all
             select
               d_start_seans_from_zvonok dt
           ) x
         )
;


select
  *
from
  #data
order by
  -- сортировка по Дате звонка по возрастанию
  case when @dZvOrderBy = 1 then d_zv else 0 end asc,
  case when @dZvOrderBy = 2 then d_zv else 0 end desc,
  ID desc
offset
  (@page - 1) * @rows_per_page rows
fetch next
  @rows_per_page rows only
;

if object_id('tempdb..#data') is not null drop table #data;  

end;

go


set dateformat dmy;
exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 3000, @m_org_id = 2, @productIds = '-1'
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 31, @fio = '', @posHodit = 2, @posDn = 5, @zabolId = 0;
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 2, @fio = '', @posHodit = 1, @posDn = 5, @zabolId = 0,  @periodS = '16.01.2017', @periodPo = '16.01.2017';
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 2, @fio = '', @posHodit = 0, @posDn = 0
--exec dbo.GET_BAZA_LIST @page = 1, @rows_per_page = 300, @m_org_id = 2, @fio = '', @posHodit = 0, @posDn = 0, @zabolId = 369, @periodS = '16.01.2017', @periodPo = '17.01.2017';



-- select * from dbo.o_seans where o_ank_id = 224
