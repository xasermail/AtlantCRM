if exists(select 1 from sys.procedures as a where a.name = 'GET_SALES_CALENDAR') drop procedure dbo.GET_SALES_CALENDAR;

GO

create procedure [dbo].[GET_SALES_CALENDAR]
	@date0 smalldatetime,
	@date1 smalldatetime,
	@m_org_id int
as 
begin
	--�� ��������: ������������� ����������, ����������
	declare @mStatusIdPotPok int = 2, @mStatusIdPredop int = 11, @i int = 1, @cnt int = 0, @min_id int = 0,
					@date_min smalldatetime, @date_max smalldatetime;

	if object_id('tempdb..#tmp') is not null drop table #tmp;

	select s.ID,
				 s.O_ANK_ID,
				 isnull(a.SURNAME + ' ','') + isnull(a.[NAME] + ' ','') + isnull(a.SECNAME,'') FIO,
				 s.M_PRODUCT_ID,
				 p.NAME M_PRODUCT_ID_NAME,
				 cast(s.STATUS_DATE as date) STATUS_DATE,
				 anu.USERNAME,
				 -- ��������� ���� �� �����
				 coalesce(
					 -- ���� ����� � ��������� � ������ �, ������� ��������� � ������ �
					 (select max(da.ROZN)
							from O_DILER_A_PRICE da
							join M_ORG oa on da.M_ORG_ID = oa.ID
							join M_ORG oc on oc.PARENT_ID = oa.ID
							join M_ORG od on od.PARENT_ID = oc.ID
						 where da.M_PRODUCT_ID_TOVAR = s.M_PRODUCT_ID
							 and od.ID = a.M_ORG_ID),
					 -- ���� ����� � ��������� � ������ �
					 (select max(da.ROZN)
							from O_DILER_A_PRICE da
							join M_ORG oa on da.M_ORG_ID = oa.ID
							join M_ORG od on od.PARENT_ID = oa.ID
						 where da.M_PRODUCT_ID_TOVAR = s.M_PRODUCT_ID
							 and od.ID = a.M_ORG_ID),
				 -- ��� ����
				 0) PRICE,
				 cast(null as int) DAY_RN,
				 cast(null as varchar(50)) DAY_NAME,
				 cast(null as int) DAY_HEADER
		into #tmp
		from O_STATUS as s
		join O_ANK as a on a.ID = s.O_ANK_ID
		join M_PRODUCT p on p.ID = s.M_PRODUCT_ID
		left join S_USER u on u.ID = s.USERID
		left join ASPNETUSERS anu on anu.Id = u.AspNetUsersId
	 where cast(s.STATUS_DATE as date) >= cast(@date0 as date) and cast(s.STATUS_DATE as date) <= cast(@date1 as date)
		 and a.M_ORG_ID = @m_org_id
		 and s.M_STATUS_ID in (@mStatusIdPotPok, @mStatusIdPredop)
		 and not exists(select *
											from O_SKLAD_RAS r
											join O_SKLAD_RAS_PRODUCT p on r.ID = p.O_SKLAD_RAS_ID
											join O_SKLAD_RAS_PRODUCT_OPL o on p.ID = o.O_SKLAD_RAS_PRODUCT_ID
										 where isnull(o.OPL,0) > 0 and p.M_PRODUCT_ID = s.M_PRODUCT_ID
											 and r.O_ANK_ID = s.O_ANK_ID);

	select @date_min = cast(@date0 as date), @date_max = cast(@date1 as date);
	
	while (@date_min <= @date_max) begin
		-- ��������� ���� ��� ������������ �������, ���� ��� ��� ����� ��������
		select @cnt = count(*) from #tmp where cast(STATUS_DATE as date) = cast(@date_min as date);

		if (@cnt = 0) begin
			insert into #tmp (STATUS_DATE, ID, O_ANK_ID, FIO, PRICE, M_PRODUCT_ID)
			select @date_min, @i, @i, '', 0, 0;
		end;

		-- DAY_RN - ��� ������ ������ �� ��������� �������, ��� ������� �� ������ ������� 
		update #tmp
			 set DAY_RN = @i
		 where cast(STATUS_DATE as date) = cast(@date_min as date);
		
		-- ������ ������ ����� ����������� ������ � ������� - ����, ���� ������ � ����� ��������
		select @min_id = min(id) from #tmp where DAY_RN = @i;
		update #tmp
			 set DAY_HEADER = 1,
					 DAY_NAME = CASE DATEDIFF(DAY,0, STATUS_DATE)%7
											  WHEN 0 THEN '��, '
											  WHEN 1 THEN '��, '
											  WHEN 2 THEN '��, '
											  WHEN 3 THEN '��, '
											  WHEN 4 THEN '��, '
											  WHEN 5 THEN '��, '
											  WHEN 6 THEN '��, '
										  END +
										  cast(DAY(STATUS_DATE) as varchar(4)) +
										  CASE MONTH(STATUS_DATE)
											  WHEN 1 THEN ' ���'
											  WHEN 2 THEN ' ���'
											  WHEN 3 THEN ' ���'
											  WHEN 4 THEN ' ���'
											  WHEN 5 THEN ' ���'
											  WHEN 6 THEN ' ���'
											  WHEN 7 THEN ' ���'
											  WHEN 8 THEN ' ���'
											  WHEN 9 THEN ' ���'
											  WHEN 10 THEN ' ���'
											  WHEN 11 THEN ' ���'
											  WHEN 12 THEN ' ���'
										  END
		 where ID = @min_id;

		select @date_min = @date_min + 1, @i = @i + 1; 
	end;

	select * from #tmp order by DAY_RN, M_PRODUCT_ID asc;
end;

GO

	set dateformat dmy;
	declare
		@date0 smalldatetime = getdate()-7,
		@date1 smalldatetime = getdate()+7;

	exec [dbo].[GET_SALES_CALENDAR] @date0, @date1, 2;

GO