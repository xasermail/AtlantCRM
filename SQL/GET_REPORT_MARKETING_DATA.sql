if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_MARKETING_DATA') drop procedure dbo.GET_REPORT_MARKETING_DATA;

GO

create procedure dbo.GET_REPORT_MARKETING_DATA
	@m_org_id int = null,
	@date0 smalldatetime = null,
	@date1 smalldatetime = null
as
begin
	declare @noviy int, @seans int, @dni int, @rodn int, @vsego int, @napoln float, @prodaji int, @tmp float;
		
	if object_id('tempdb..#data') is not null drop table #data;
	select isnull((select max(1) from O_ANK a
									where a.M_ORG_ID = s.M_ORG_ID 
										and cast(s.d_reg as date) = cast(a.DATE_REG as date) and a.ID = s.O_ANK_ID),0) NEW,
				 (select count(*) from o_seans o
					 where o.o_ank_id = s.O_ANK_ID
						 and cast(o.d_reg as date) <= cast(s.D_REG as date) and o.seans_state = 1 and m_org_id = s.M_ORG_ID) VISITS,
				 isnull((select max(1) from O_SKLAD_RAS r
									 join O_SKLAD_RAS_PRODUCT p on r.ID = p.O_SKLAD_RAS_ID
									where p.M_ORG_ID = s.M_ORG_ID and p.OPL_OST = 0 and r.O_ANK_ID = s.O_ANK_ID
										and p.COST > 0 and p.D_VID >= cast(s.D_REG as date) and p.D_VID <= cast(s.D_REG as date)),0) PRODAJI,
				 s.*
		into #data
		from O_SEANS s
	 where cast(s.d_reg as date) between cast(@date0 as date) and cast(@date1 as date)
		 and s.M_ORG_ID = @m_org_id;

	select @noviy = count(*) from #data where new = 1;
	select @seans = count(distinct M_SEANS_TIME_ID) from #data where M_SEANS_TIME_ID is not null;
	select @dni = count(distinct cast(D_REG as date)) from #data;
	select @rodn = count(*) from #data where visits > 20;
	select @vsego = count(*) from #data;
	select @napoln = (@vsego * 1.00) / 18.00 / (case when @seans = 0 then 1 else @seans end * 1.00);
	select @prodaji = count(*) from #data where prodaji = 1;

	select @noviy noviy, @seans seansi, @dni dni, @rodn rodn, @vsego vsego, round(@napoln,4) * 100 napoln, @prodaji prodaji;
end;

go

--set dateformat dmy;
--exec dbo.GET_REPORT_MARKETING_DATA @m_org_id = 2, @date0 = '22.06.2017', @date1 = '22.06.2017';