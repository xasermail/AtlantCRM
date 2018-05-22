if exists(select 1 from sys.procedures as a where a.name = 'GET_REPORT_UVEDOML') drop procedure dbo.GET_REPORT_UVEDOML;

GO

create procedure dbo.GET_REPORT_UVEDOML
	@date0 smalldatetime,
	@date1 smalldatetime,
	@m_org_id int as
begin
	if object_id('tempdb..#data') is not null drop table #data;
	if object_id('tempdb..#report') is not null drop table #report;
	
	select sum(case when u.ISP = 1 then 1 else 0 end) VOBSHEM_ISP,
				 sum(1) VOBSHEM,
				 sum(case when u.ISP = 1 and u.M_VID_SOB_ID = 1 then 1 else 0 end) ZVONOK_ISP,
				 sum(case when u.M_VID_SOB_ID = 1 then 1 else 0 end) ZVONOK,
				 sum(case when u.ISP = 1 and u.M_VID_SOB_ID = 5 then 1 else 0 end) DOPLATA_ISP,
				 sum(case when u.M_VID_SOB_ID = 5 then 1 else 0 end) DOPLATA,
				 sum(case when u.ISP = 1 and u.M_VID_SOB_ID = 3 then 1 else 0 end) NEPRISHEDSHIE_iSP,
				 sum(case when u.M_VID_SOB_ID = 3 then 1 else 0 end) NEPRISHEDSHIE,
				 sum(case when u.ISP = 1 and u.M_VID_SOB_ID = 2 then 1 else 0 end) NAPOMINANIE_ISP, 
				 sum(case when u.M_VID_SOB_ID = 2 then 1 else 0 end) NAPOMINANIE,
				 (select max(UserName)
						from AspNetUsers a
						join dbo.S_USER s on a.id = s.AspNetUsersId
					 where s.ID = u.USERID) SOTRUDNIK,
				 row_number() over(order by u.USERID desc) ID
		into #data
		from dbo.O_UVEDOML u
	 where u.M_ORG_ID = @m_org_id
		 and cast(u.D_SOB as date) between cast(@date0 as date) and cast(@date1 as date)
	 group by u.USERID;

	 select case 
					  when VOBSHEM_ISP = 0 then cast(VOBSHEM as varchar(10))
						else cast(VOBSHEM_ISP as varchar(10)) + '/' + cast(VOBSHEM as varchar(10))
					end VOBSHEM,
					case 
						when ZVONOK_ISP = 0 then cast(ZVONOK as varchar(10))
						else cast(ZVONOK_ISP as varchar(10)) + '/' + cast(ZVONOK as varchar(10))
					end ZVONOK,
					case 
						when DOPLATA_ISP = 0 then cast(DOPLATA as varchar(10))
						else cast(DOPLATA_ISP as varchar(10)) + '/' + cast(DOPLATA as varchar(10))
					end DOPLATA,
					case 
						when NEPRISHEDSHIE_iSP = 0 then cast(NEPRISHEDSHIE as varchar(10))
						else cast(NEPRISHEDSHIE_iSP as varchar(10)) + '/' + cast(NEPRISHEDSHIE as varchar(10))
					end NEPRISHEDSHIE,
					case 
						when NAPOMINANIE_ISP = 0 then cast(NAPOMINANIE as varchar(10))
						else cast(NAPOMINANIE_ISP as varchar(10)) + '/' + cast(NAPOMINANIE as varchar(10))
					end NAPOMINANIE,
					SOTRUDNIK,
					ID
		 into #report
		 from #data;

	 insert into #report
	 select case
					  when sum(VOBSHEM_ISP) = 0 then cast(sum(VOBSHEM) as varchar(10))
						else cast(sum(VOBSHEM_ISP) as varchar(10)) + '/' + cast(sum(VOBSHEM) as varchar(10))
					end VOBSHEM,
					case 
						when sum(ZVONOK_ISP) = 0 then cast(sum(ZVONOK) as varchar(10))
						else cast(sum(ZVONOK_ISP) as varchar(10)) + '/' + cast(sum(ZVONOK) as varchar(10))
					end ZVONOK,
					case 
						when sum(DOPLATA_ISP) = 0 then cast(sum(DOPLATA) as varchar(10))
						else cast(sum(DOPLATA_ISP) as varchar(10)) + '/' + cast(sum(DOPLATA) as varchar(10))
					end DOPLATA,
					case 
						when sum(NEPRISHEDSHIE_ISP) = 0 then cast(sum(NEPRISHEDSHIE) as varchar(10))
						else cast(sum(NEPRISHEDSHIE_ISP) as varchar(10)) + '/' + cast(sum(NEPRISHEDSHIE) as varchar(10))
					end NEPRISHEDSHIE,
					case 
						when sum(NAPOMINANIE_ISP) = 0 then cast(sum(NAPOMINANIE) as varchar(10))
						else cast(sum(NAPOMINANIE_ISP) as varchar(10)) + '/' + cast(sum(NAPOMINANIE) as varchar(10))
					end NAPOMINANIE,
					'Всего',
					(select max(ID)+1 from #data)
		 from #data;

	select VOBSHEM, ZVONOK, DOPLATA, NEPRISHEDSHIE, NAPOMINANIE, SOTRUDNIK from #report order by ID asc;

	if object_id('tempdb..#data') is not null drop table #data;
	if object_id('tempdb..#report') is not null drop table #report;
end;

GO

declare
	@date0 smalldatetime = getdate()-8,
	@date1 smalldatetime = getdate(),
	@m_org_id int = 2;

exec dbo.GET_REPORT_UVEDOML @date0, @date1, @m_org_id;

GO