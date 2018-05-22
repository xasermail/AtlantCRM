if exists(select 1 from sys.procedures as a where a.name = 'GET_SKLAD_POKUP_DATA') drop procedure dbo.GET_SKLAD_POKUP_DATA;

GO

create procedure [dbo].[GET_SKLAD_POKUP_DATA]
	@m_org_id int,
	@date0 smalldatetime,
	@date1 smalldatetime,
  @ostalos_dn_abon_ot int,
  @ostalos_dn_abon_do int,
  @m_method_opl_id int,
  @vip int,
  @page int,
  @rows_per_page int,
  @recCnt int out
as
begin

  if object_id('tempdb..#get_sklad_pokup_data') is not null begin
    drop table #get_sklad_pokup_data;
  end;

  create table #get_sklad_pokup_data(
    id int not null identity primary key,
    vip int,
    fio varchar(500),
    d_vid smalldatetime,
    phone varchar(500),
    name varchar(500),
    vid varchar(500),
    summa decimal(18, 2),
    o_ank_id int,
    m_product_id int,
    rn int,
    kolvo int,
    ostalos_dn_abon int,
    seans_cnt int,
    m_method_opl_id int,
    o_sklad_ras_id int,
    stage int -- stage = 1 - первичное заполнение, все данные, stage = 2 - ограниченное количество записей дл€ страницы
  );


  insert into #get_sklad_pokup_data(vip, fio, d_vid, phone, name, vid, summa, o_ank_id, m_product_id, rn, kolvo, ostalos_dn_abon, seans_cnt, m_method_opl_id, o_sklad_ras_id, stage)
	select 
    a.vip,
    a.fio,
		max(a.d_vid) d_vid,
		a.phone,
		a.name,
		a.vid,
		sum(a.summa) summa,
		a.o_ank_id,
		a.m_product_id,
		-1 rn, -- вычисл€етс€ ниже
		max(a.kolvo) kolvo,
    a.ostalos_dn_abon,
    a.seans_cnt,
    max(a.m_method_opl_id) m_method_opl_id,
    max(a.o_sklad_ras_id) o_sklad_ras_id,
    1 stage
	from
    (
		  -- есть анкета
		  select
        a.VIP vip,
        isnull(a.surname,'') + ' ' +
				  isnull(substring(a.name,1,1)+ '. ','') +
				  isnull(substring(a.secname,1,1)+ '.','') fio,
			  p.d_vid,
			  isnull(a.phone_mobile, a.phone_home) phone,
			  m.name,
			  case when isnull(p.is_vid,0) = 1 then 'ƒа' else 'Ќет' end vid,
			  isnull(o.opl,0) summa,
			  r.o_ank_id,
			  m.id m_product_id,
			  isnull(p.kolvo,0) kolvo,
        dbo.GET_ABON_DAY_COUNT_LAST(a.ID, @m_org_id) ostalos_dn_abon,
        (select count(*) from dbo.O_SEANS o where o.O_ANK_ID = a.ID and o.SEANS_STATE = 1 and o.M_ORG_ID = @m_org_id) seans_cnt,
        o.M_METOD_OPL_ID m_method_opl_id,
        r.id o_sklad_ras_id
		  from o_sklad_ras r
			  join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
			  join o_sklad_ras_product_opl o on o.o_sklad_ras_product_id = p.id
			  join o_ank a on r.o_ank_id = a.id
			  join m_product m on p.m_product_id = m.id
			  where r.m_org_id = @m_org_id
				  and cast(p.D_VID as date) between cast(@date0 as date) and cast(@date1 as date)
				  and isnull(p.is_vid,0) = 1
			  union all
		  -- без анкеты
		  select
        0 vip,
        isnull(r.surname,'') + ' ' +
				  isnull(substring(r.name,1,1)+ '. ','') +
				  isnull(substring(r.secname,1,1)+ '.','') fio,
			  p.d_vid,
			  r.phone_mobile phone,
			  m.name,
			  case when isnull(p.is_vid,0) = 1 then 'ƒа' else 'Ќет' end vid,
			  isnull(o.opl,0) summa,
			  r.o_ank_id,
			  m.id m_product_id,
			  isnull(p.kolvo,0) kolvo,
        0 ostalos_dn_abon,
        0 seans_cnt,
        o.M_METOD_OPL_ID m_method_opl_id,
        r.id o_sklad_ras_id
		  from o_sklad_ras r
			  join o_sklad_ras_product p on r.id = p.o_sklad_ras_id
			  join o_sklad_ras_product_opl o on o.o_sklad_ras_product_id = p.id
			  join m_product m on p.m_product_id = m.id
			  where r.m_org_id = @m_org_id
				  and cast(p.D_VID as date) between cast(@date0 as date) and cast(@date1 as date)
				  and r.o_ank_id is null
				  and isnull(p.is_vid,0) = 1
	  ) a
	group by
    a.vip,
    a.fio,
    a.phone,
    a.name,
    a.vid,
    a.o_ank_id,
    a.m_product_id,
    a.ostalos_dn_abon,
    a.seans_cnt
	order by 
    a.m_product_id
  ;


  -- исключаю тех, у кого количество оставшихс€ дней абонемента
  -- не подходит под переданное условие
  delete
    t
  from
    #get_sklad_pokup_data t
  where
    not t.ostalos_dn_abon between @ostalos_dn_abon_ot and @ostalos_dn_abon_do
  ;

  -- исключаю по методу оплаты
  if (@m_method_opl_id is not null) begin
    delete
      t
    from
      #get_sklad_pokup_data t
    where
      (t.m_method_opl_id is null or t.m_method_opl_id != @m_method_opl_id)
    ;
  end;

  -- исключаю по VIP
  if (@vip is not null) begin
    delete
      t
    from
      #get_sklad_pokup_data t
    where
      t.vip != @vip
    ;
  end;

  select @recCnt = count(*) from #get_sklad_pokup_data;

  insert into #get_sklad_pokup_data(vip, fio, d_vid, phone, name, vid, summa, o_ank_id, m_product_id, rn, kolvo, ostalos_dn_abon, seans_cnt, m_method_opl_id, o_sklad_ras_id, stage)
  select
    d.vip,
    d.fio,
    d.d_vid,
    d.phone,
    d.name,
    d.vid,
    d.summa,
    d.o_ank_id,
    d.m_product_id,
    -1 rn,
    d.kolvo,
    d.ostalos_dn_abon,
    d.seans_cnt,
    d.m_method_opl_id,
    d.o_sklad_ras_id,
    2 stage
  from
    #get_sklad_pokup_data d
  order by
    d.d_vid desc
  offset
    (@page - 1) * @rows_per_page rows
  fetch next
    @rows_per_page rows only
  ;

  -- удал€ю результаты, которые не относ€тс€ к выбранной странице, приходитс€ так делать
  -- потому что row_number() не удаЄтс€ применить совместно с offset и fetch next, т.к.
  -- row_number() отработает до них; соответственно разбил это на 2 этапа
  delete d from #get_sklad_pokup_data d where d.stage = 1;


  select
    d.vip,
    d.fio,
    d.d_vid,
    d.phone,
    d.name,
    d.vid,
    d.summa,
    d.o_ank_id,
    d.m_product_id,
    cast(row_number() over(partition by d.m_product_id order by d.m_product_id, d.d_vid desc) as int) rn,
    d.kolvo,
    d.ostalos_dn_abon,
    d.seans_cnt,
    d.m_method_opl_id,
    d.o_sklad_ras_id
  from
    #get_sklad_pokup_data d
  order by
    d.m_product_id,
    d.d_vid desc
  ;

  if object_id('tempdb..#get_sklad_pokup_data') is not null begin
    drop table #get_sklad_pokup_data;
  end;

end;


go

set dateformat dmy;
declare @recCnt int;
exec [dbo].[GET_SKLAD_POKUP_DATA] @m_org_id = 2, @date0 = '01.01.2017', @date1 = '01.01.2020', @ostalos_dn_abon_ot = -1000, @ostalos_dn_abon_do = 10000, @m_method_opl_id = 2, @vip = null, @page = 1, @rows_per_page = 10, @recCnt = @recCnt out;
print @recCnt;