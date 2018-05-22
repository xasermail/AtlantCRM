if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_SALES') drop procedure dbo.GET_REPORT_SALES;

GO

create procedure [dbo].[GET_REPORT_SALES]
	@date0 smalldatetime,
	@date1 smalldatetime,
	@m_org_id int as
begin
	set dateformat dmy;
	declare
		@pol varchar(50) = '', @vozrast int = 0, @kolpos int = 0, @kolpokup int = 0, @kakdolgo int = 0,
		@kupilnasummu numeric(12,2) = 0, @ludei int = 0, @mens int = 0, @womens int = 0, @kolpok numeric(12,2) = 0;
		
	if object_id('tempdb..#data') is not null drop table #data;

	select a.sex pol,
				 datediff(year,a.BIRTHDAY,o.D_OPL) vozrast,
				 p.id,
				 (select count(*) from o_seans s 
					 where s.o_ank_id = a.id 
						 and cast(s.d_reg as date) >= cast(@date0 as date) 
						 and cast(s.d_reg as date) <= cast(o.d_opl as date)
						 and s.seans_state = 1 
						 and s.m_org_id = @m_org_id) kolpos,
				 (select count(*) from o_seans s 
					where s.o_ank_id = a.id
						and cast(s.d_reg as date) <= cast(o.d_opl as date)
						and s.seans_state = 1
						and s.m_org_id = @m_org_id) kakdolgo,
				 a.ID o_ank_id,
				 o.opl
		into #data
		from O_SKLAD_RAS r
	join O_SKLAD_RAS_PRODUCT p on r.ID = p.O_SKLAD_RAS_ID
	join O_SKLAD_RAS_PRODUCT_OPL o on p.ID = o.O_SKLAD_RAS_PRODUCT_ID
	left join O_ANK a on r.O_ANK_ID = a.ID
	where o.D_OPL between cast(@date0 as date) and cast(@date1 as date)
		and r.M_ORG_ID = @m_org_id
		and p.M_PRODUCT_ID is not null;

	set @ludei = (select count(distinct o_ank_id) from #data where o_ank_id is not null);
	set @ludei = case when @ludei = 0 then 1 else @ludei end;
	set @vozrast = cast((select sum(a.vozrast) from ( select max(vozrast) vozrast from #data where o_ank_id is not null group by o_ank_id) a) / @ludei as int);
	set @kolpokup = (select count(distinct id) from #data where id is not null);
	set @kolpokup = case when @kolpokup = 0 then 1 else @kolpokup end;
	set @kolpos = cast((select sum(a.kolpos) from ( select max(kolpos) kolpos from #data where id is not null group by id) a) / @kolpokup as int);
	set @kakdolgo = cast((select sum(a.kakdolgo) from ( select max(kakdolgo) kakdolgo from #data where o_ank_id is not null group by o_ank_id) a)/ @ludei as int);
	set @mens =(select sum(case when pol = 1 then 1 else 0 end) from (select max(pol) pol, 1 cnt from #data where o_ank_id is not null group by o_ank_id) a);
	set @womens =(select sum(case when pol = 2 then 1 else 0 end) from (select max(pol) pol, 1 cnt from #data where o_ank_id is not null group by o_ank_id) a);
	set @pol = case when @mens > @womens then 'Мужчина' else 'Женщина' end;
	set @kolpok = round(cast(cast(@kolpokup as float) / cast(@ludei as float) as float),0);
	set @kupilnasummu = round((select sum(opl) from #data) / @ludei, 0);
	
	if ((@kolpok = 0) or (@kupilnasummu is null)) begin
		set @pol = null;
		set @vozrast = null;
		set @kolpos = null;
		set @kakdolgo = null;
		set @kolpok = null;
		set @kupilnasummu = null;
	end;	

	select @pol pol, @vozrast vozrast, @kolpos kolpos, @kakdolgo kakdolgo, @kolpok kolpok, @kupilnasummu kupilnasummu;
end;